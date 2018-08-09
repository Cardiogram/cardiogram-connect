
# Cardiogram Connect

API Documentation and example code for Cardiogram Connect. If you're here, you're likely an
integration partner -- welcome! We're excited to work with you. Feel free to email
connect@cardiogr.am with any questions.


# Getting Started

You should have received a client id and client secret from us, likely for both your development
and production environments. Note that each client id and client secret will only work with a
particular redirect URI on your system. If you need to support additional testing redirect URIs,
please email connect@cardiogr.am.


# User Authentication and Consent with OAuth 2

Cardiogram's developer APIs use OAuth 2 for authentication, and data sharing is always done with
the user's consent. If you're creating a new user and sending data to Cardiogram
("Powered by Cardiogram"), then, as part of onboarding, we'll check that correct language is in
place in each company's terms of service, privacy policy, and user interface. If you're requesting
metrics from an existing Cardiogram user, then the redirect flow below will show the user a dialog
within the Cardiogram app giving them the choice of whether to share, and if they tap yes, will
then redirect to a URL with a temporary auth code. In either case, the next step is then to
exchange the temporary auth code for OAuth 2 access tokens that can be used in subsequent API
calls.

## Creating a new user account

To create a new user account, post to `/heart/oauth/users` with a `memberId` (a stable identifier
used by your system):

```
POST https://cardiogr.am/heart/oauth/users

Headers
  Authorization: 'Basic <Base64-encoded ClientId:ClientSecret>'
  'Content-Type': 'application/x-www-form-urlencoded'

Body:
  {
    memberId : <string_member_id>
  }
```

**Response**:

```
Status Code: 200 // Success.
Body: {
    userId: <unique_integer>
    code: <unique_access_code_string>
  }

Status Code: 400
Body: { "Credentials not valid / missing fields in header." }
```

The response will include both a Cardiogram `userId` and an authorization `code`, which can be exchanged for access tokens as described below in the below section **"Exchanging an auth code for OAuth 2 tokens"**.


## Requesting data from an existing Cardiogram user

Users explicitly choose to share data via a dialog that explains what they're sharing and
with whom, similar to the Signing in with Google. To obtain the user's consent,
send them to the auth URL with your client id and redirect URI:

  `https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>&redirect_uri=<YOUR_REDIRECT_URI>/&scope=cardiograms`

If the user clicks on "Yes, Share my data," you'll receive an temporary auth code as a parameter
to your redirect URI:

  `https://your.redirect.uri/goes/here?code=XXXXXXXXXX`

You can then exchange this auth code for tokens as described in the next section.


## Exchanging an auth code for OAuth2 tokens.

To exchange the **auth code** for **access and refresh tokens**, post to the `/oauth/token` URI.
Note that your OAuth2 library may abstract the below token exchange process,
but if you need to implement it explicitly, then make an HTTP Post similar to the below:

```
POST https://cardiogr.am/heart/oauth/token

Headers
  Authorization: 'Basic <Base64-encoded ClientId:ClientSecret>'
  'Content-Type': 'application/x-www-form-urlencoded'

Body:
  grantType: 'authorization_code',
  clientId: <YOUR_CLIENT_ID>,
  clientSecret: <YOUR_CLIENT_SECRET>,
  code: <AUTH_CODE>,
```

You'll receive a response with an `access_token` field, which you can use to access any of the
following API endpoints on behalf of that particular user.


# API Endpoints

## Posting heart rate data: /oauth/users/beats

You can post heart rate data from a wearable device for a particular user using the `/oauth/users/beats` URI:

```
POST https://cardiogr.am/heart/oauth/users/beats

Headers
  Authorization: Bearer <ACCESS_TOKEN>

Body:
  {
    memberId: <string>,
    beats: <Array>([
      {
        start: <UTC timestamp in seconds>,
        end: <UTC timestamp in seconds>,
        value: <float heart rate>,
      }
    ])
  }
```

**Response**
The  response will be an empty JSON map, or, if there is an error, a JSON map with a single "error" field:
```
Status Code: 200
Body: {}

Status Code: 400
Body: {"Heart rates contain negative value."}

Status Code: 400
Body: {"Timestamps ('start' or 'end') are not in UNIX seconds/"}

Status Code: 400
Body: {"Malformed input."}

Status Code: 400
Body: {"User does not exist."}

Status Code: 403
Body: {"Forbidden: 'memberId' does not match access token."}
```
Note that, for heart rate data derived from Apple HealthKit, `start` will equal `end`.



## Posting step count data: /oauth/users/steps

Post step counts for a user by using the `/oauth/users/steps` URI:

```
POST https://cardiogr.am/heart/oauth/users/steps

Headers
  Authorization: Bearer <ACCESS_TOKEN>

Body:
  {
    memberId: <string>,
    steps: <Array>([
      {
        start: <UTC timestamp in seconds>,
        end: <UTC timestamp in seconds>,
        value: <integer step count>,
      }
    ])
  }
```
**Response**
The  response will be an empty JSON map, or, if there is an error, a JSON map with a single "error" field:
```
Status Code: 200
Body: {}

Status Code: 400
Body: {"Step values contain negative value."}

Status Code: 400
Body: {"Timestamps ('start' or 'end') are not in UNIX seconds."}

Status Code: 400
Body: {"End time greater than start time for a step data point."}

Status Code: 400
Body: {"Malformed input."}

Status Code: 400
Body: {"User does not exist."}

Status Code: 403
Body: {"Forbidden: 'memberId' does not match access token."}
```

## Posting covariates /oauth/users/covariates

In order to generate risk scores, we require a certain set of covariates -- age, sex,
heart-rate-modifying medications like beta blockers, and so on -- that influence the way our
system interprets the user's heart rate data. You can post these via `/heart/oauth/users/covariates`:

```
POST https://cardiogr.am/heart/oauth/users/covariates

Headers
  Authorization: Bearer <ACCESS_TOKEN>

Body:
  {
    memberId: "jsmith123",
    dateOfBirth: 1957,
    heightInches: 65,
    weightLbs: 155,
    sex: "female",
    useBetaBlockers: False
    misc: {
      'postal': <zipcode>
      'occupation': <string>
      <insert_data>: <>}
  }
```

The response will be an empty JSON map, or, if there is an error, a JSON map with a single "error" field:
```
Status Code: 200
Body: {}

Status Code: 400
Body: {"Malformed input."}

Status Code: 400
Body: {"User does not exist."}

Status Code: 403
Body: {"Forbidden: 'memberId' does not match access token."}
```

## Getting risk scores /oauth/users/risk_scores
After we've received sufficient data for a particular user, we will begin producing risk scores for a particular user. However, risk scores will not be immediately retrievable upon posting the data. Because we need to receive sufficient data and run them through our models, there may be a few day delay between posting data and getting risk scores.

Once you have an access token, and have provided data about the user, you can issue an HTTP request to `/oauth/users/risk_scores` to get risk scores for the user.

```
GET https://cardiogr.am/heart/oauth/users/risk_scores

Headers
  Authorization: Bearer <ACCESS_TOKEN>

```

**Response**
The  response will be a JSON map with attributes regarding risk scores for the user, or a JSON map with a single "error" field:
```
Status Code: 200
Body: {
  modelVersion: <model_version> 'abc123',
  date: <date_of_scoring> 2018-08-02,
  diabetes: <risk_percentile> 80.0 // %-tile compared across all available users.
  sleep_apnea: <risk_percentile> 56.0
  hypertension: <risk_percentile> 89.0
}

Status Code: 400
Body: { error: "Insufficient data for prediction."}

Status Code: 400
Body: { error: "Risk scores not available yet."}
```



## Getting User Info: /oauth/basic_info
Once you have an access token, you can get basic profile information by issuing an HTTP GET
request to /oauth/basic_info:

```
GET https://cardiogr.am/oauth/basic_info

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

Response:
```
  {
    cardiogram_user_id: 8100
  }
```


## Getting metrics and risk scores: /oauth/metrics
You can get the contents of the user's metrics pane--including resting heart rate, step counts, and risk scores--with
the /oauth/metrics URI:

```
GET https://cardiogr.am/oauth/basic_info

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

Response:
```
  {
    '2017-03-01': {RESTING_BPM: 76, STEPS: 9121, MOVE: 310, SLEEP_BPM: 52, AF_SCORE: 0.10, DIAB_SCORE: 0.78},
    '2017-03-02': {RESTING_BPM: 74, STEPS: 13733, MOVE: 491, SLEEP_BPM: 51, AF_SCORE: 0.08, DIAB_SCORE: 0.13},
    ...
  }
```


## Example Code

We've written a sample project, using NodeJS, in simple-server.js. To run the server, make sure NodeJS is installed
and then run this command in your terminal:
`CLIENT_SECRET=<YOUR_CLIENT_SECRET> PORT=9000 node simple-server.js`
