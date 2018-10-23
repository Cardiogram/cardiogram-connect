# Cardiogram Connect

API Documentation and example code for Cardiogram Connect. If you're here, you're likely an
integration partner -- welcome! We're excited to work with you. Feel free to email
connect@cardiogr.am with any questions.

## Getting Started

You should have received a `client id` and `client secret` from us, likely for both your development
and production environments. Note that each client id and client secret will only work with a
particular redirect URI on your system. If you need to support additional testing redirect URIs,
please email connect@cardiogr.am.

## User Authentication and Consent with OAuth 2

Cardiogram's developer APIs use OAuth 2 for authentication, and data sharing is always done with
the user's consent. If you're creating a new user and sending data to Cardiogram
("Powered by Cardiogram"), then, as part of onboarding, we'll check that correct language is in
place in each company's terms of service, privacy policy, and user interface.

If you're requesting metrics from an existing Cardiogram user, then the redirect flow in the
examples will show the user a dialog within the Cardiogram app giving them the choice of whether
to share, and if they tap yes, will then redirect to a URL with a temporary auth code.

In either case, the next step is then to exchange the temporary auth code for OAuth 2 access tokens
that can be used in subsequent API calls.

### Creating a new user account

To create a new user account, post to `/heart/oauth/users` with a `memberId` (a stable identifier
used by your system):

```
POST https://cardiogr.am/heart/oauth/users

Headers
  Authorization: 'Basic <Base64-encoded ClientId:ClientSecret>'
  Content-Type: 'application/x-www-form-urlencoded'

Body:
  memberId: <String> Member ID to identify with your system
```

**Response**:

```
Status Code: 200 // Success.
Body:
  {
    userId: <String> Cardiogram User ID
    code: <String> Your `AUTH_CODE` used to exchange for auth tokens
  }

Status Code: 400
Body:
  { message: "Credentials not valid / missing fields in header." }
```

The response will include both a Cardiogram `userId` and an authorization `code`, which can be
exchanged for access tokens as described below in the below section **"Exchanging an auth code for
OAuth 2 tokens"**.

### Requesting data from an existing Cardiogram user

Users explicitly choose to share data via a dialog that explains what they're sharing and
with whom, similar to the "Sign in with Google." To obtain the user's consent,
send them to the auth URL with your client id and redirect URI:

`https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>&redirect_uri=<YOUR_REDIRECT_URI>/&scope=cardiograms`

If the user clicks on "Yes, Share my data," you'll receive an temporary auth code as a parameter
to your redirect URI:

`https://your.redirect.uri/goes/here?code=XXXXXXXXXX`

You can then exchange this auth code for tokens as described in the next section.

### Exchanging an auth code for OAuth2 tokens.

To exchange the **auth code** for **access and refresh tokens**, post to the `/oauth/token` URI.
Note that your OAuth2 library may abstract the below token exchange process,
but if you need to implement it explicitly, then make an HTTP Post similar to the below:

```
POST https://cardiogr.am/heart/oauth/token

Headers
  Authorization: 'Basic <Base64-encoded ClientId:ClientSecret>'
  Content-Type: 'application/x-www-form-urlencoded'

Body:
  grantType: 'authorization_code',
  clientId: <YOUR_CLIENT_ID>,
  clientSecret: <YOUR_CLIENT_SECRET>,
  code: <AUTH_CODE>,
```

You'll receive a response with an `access_token` field, which you can use to access any of the
following API endpoints on behalf of that particular user.

## API Endpoints

> Note: These API endpoints and documentation are still in progress

### Posting heart rate data: /oauth/users/:userId/beats

Add heart rate data from a wearable device for a particular user:

```
POST https://cardiogr.am/heart/oauth/users/:userId/beats

Headers
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: 'application/json'

Body:
  {
    beats: <Array>([
      {
        start: <UTC Timestamp in seconds>,
        end: <UTC Timestamp in seconds>,
        value: <Float>,
      }
    ])
  }
```

**Response**
The response will be an empty JSON map, or, if there is an error, a JSON map with a single field
containing the error message:

```
Status Code: 200
Body: {}

Status Code: 400
Body: {message: "Heart rates contain negative value."}

Status Code: 400
Body: {message: "Timestamps ('start' or 'end') are not in UNIX seconds/"}

Status Code: 400
Body: {message: "Malformed input."}

Status Code: 400
Body: {message: "User does not exist."}

Status Code: 403
Body: {message: "userId does not match access token."}
```

Note that, for heart rate data derived from Apple HealthKit, `start` will equal `end`.

### Posting step count data: /oauth/users/:userId/steps

Add step counts for a user:

```
POST https://cardiogr.am/heart/oauth/users/:userId/steps

Headers
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: 'application/json'

Body:
  {
    steps: <Array>([
      {
        start: <UTC Timestamp in seconds>,
        end: <UTC Timestamp in seconds>,
        value: <Float>,
      }
    ])
  }
```

**Response**
The response will be an empty JSON map, or, if there is an error, a JSON map with a single field
containing the error message:

```
Status Code: 200
Body: {}

Status Code: 400
Body: {message: "Step values contain negative value."}

Status Code: 400
Body: {message: "Timestamps ('start' or 'end') are not in UNIX seconds."}

Status Code: 400
Body: {message: "End time greater than start time for a step data point."}

Status Code: 400
Body: {message: "Malformed input."}

Status Code: 400
Body: {message: "User does not exist."}

Status Code: 403
Body: {message: "userId does not match access token."}
```

### Posting covariates /oauth/users/:userId/covariates

In order to generate risk scores, we require a certain set of covariates -- age, sex,
heart-rate-modifying medications like beta blockers, and so on -- that influence the way our
system interprets the user's heart rate data.

```
POST https://cardiogr.am/heart/oauth/users/:userId/covariates

Headers
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: 'application/json'

Body:
  {
    dateOfBirth: <String> (YYYY-MM-DD)
    height: <String> (180 | 5'9")
    heightUnit: <Enum> ("cm" | "ft/in")
    weight: <String> (140 | 65)
    weightUnit: <Enum> ("lb" | "kg")
    sex: <Enum> ("Male" | "Female")
    isOnBetaBlocker: <Boolean>
  }
```

**Response**
The response will be an empty JSON map, or, if there is an error, a JSON map with a single field
containing the error message:

```
Status Code: 200
Body: {}

Status Code: 400
Body: {message: "Malformed input."}

Status Code: 400
Body: {message: "User does not exist."}

Status Code: 403
Body: {message: "userId does not match access token."}
```

### Getting risk scores /oauth/users/:userId/risk_scores

After we've received sufficient data for a particular user, we will begin producing risk scores for
a particular user.

Note: Risk scores may not be immediately retrievable upon posting the data since Cardiogram needs to
receive sufficient data for our model predictions.

```
GET https://cardiogr.am/heart/oauth/users/:userId/risk_scores

Headers
  Authorization: Bearer <ACCESS_TOKEN>
```

**Response**
The response will be a JSON map with attributes regarding risk scores for the user, or a JSON map
with a single field containing the error message:

```
Status Code: 200
Body:
  {
    riskScores: <Array>([
      {
        modelVersion: <String> ('1.0.0')
        score: <Float> Risk score percentile compared across all available users (80.0)
        condition: <Enum> (
        predictionTime: <UTC Timestamp in seconds>
        segmentStart: <UTC Timestamp in seconds>
        segmentEnd: <UTC Timestamp in seconds>
      }
    ])
  }

Status Code: 400
Body: { message: "Insufficient data for prediction."}

Status Code: 400
Body: { message: "Risk scores not available yet."}

Status Code: 403
Body: {message: "userId does not match access token."}
```

### Getting User Info: /oauth/users/:userId/basic_info

Retrieve basic profile information about a particular user:

```
GET https://cardiogr.am/oauth/users/:userId/basic_info

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

Response:

```
  {
    (Details are dependent on user permission grants)
  }
```

### Getting metrics and risk scores: /oauth/users/:userId/metrics

You can get the contents of the user's metrics pane -- including resting heart rate, step count:

```
GET https://cardiogr.am/oauth/users/:userId/metrics

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

Response:

```
  {
    '2017-03-01': {RESTING_BPM: 76, STEPS: 9121, MOVE: 310, SLEEP_BPM: 52},
    '2017-03-02': {RESTING_BPM: 74, STEPS: 13733, MOVE: 491, SLEEP_BPM: 51},
    ...
  }
```

## Example Code

We've written a sample project, using Node.js, under the `examples` folder. You can set up this
repository by:

1. Install [Node.js](https://nodejs.org/en/)
2. Download and install this repository with `npm install`
3. To start the demo server: `npm run start -- --CLIENT_SECRET=<YOUR_CLIENT_SECRET>`
