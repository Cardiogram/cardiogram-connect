# Cardiogram Connect

API Documentation and example code for Cardiogram Connect. If you're here, you're likely an
integration partner -- welcome! We're excited to work with you. Feel free to email
connect@cardiogr.am with any questions.


## Getting Started

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

To create a new user account, post to /heart/oauth/users/new with a member_id (a stable identifier
used by your system):

```
POST https://cardiogr.am/heart/oauth/users/new

Headers
  Authorization: 'Basic <Base64-encoded ClientId:ClientSecret>'
  'Content-Type': 'application/x-www-form-urlencoded'

Body:
  member_id: "string_member_id"
```

Response:
```
  {
    'user_id': <unique_integer>
    'code': '<unique_access_code_string>'
  }
```

The response will include both a Cardiogram user id and an auth code, which can be exchanged for access tokens
as described below in "Exchanging an auth code for OAuth 2 tokens".


# Requesting data from an existing Cardiogram user

Users explicitly choose to share data via a dialog that explains what they're sharing and
with whom, similar to the Signing in with Google. To obtain the user's consent,
send them to the auth URL with your client id and redirect URI:

  `https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>&redirect_uri=<YOUR_REDIRECT_URI>/&scope=cardiograms`

If the user clicks on "Yes, Share my data," you'll receive an temporary auth code as a parameter
to your redirect URI:

  `https://your.redirect.uri/goes/here?code=XXXXXXXXXX`

You can then exchange this auth code for tokens as described in the next section.


# Exchanging an auth code for OAuth2 tokens.

To exchange the **auth code** for **access and refresh tokens**, post to the /oauth/token URI.
Note that your OAuth2 library may abstract the below token exchange process,
but if you need to implement it explicitly, then make an HTTP Post similar to the below:

```
POST https://cardiogr.am/heart/oauth/token

Headers
  Authorization: 'Basic <Base64-encoded ClientId:ClientSecret>'
  'Content-Type': 'application/x-www-form-urlencoded'

Body:
  grant_type: 'authorization_code',
  client_id: <YOUR_CLIENT_ID>,
  client_secret: <YOUR_CLIENT_SECRET>,
  code: <AUTH_CODE>,
```

You'll receive a response with an access_token field, which you can use to access any of the
following API endpoints on behalf of that particular user.


# API Endpoints

## Posting heart rate data: /oauth/users/beats/new

You can post heart rate data from a wearable device using the /users/beats/new URI:

```
POST https://cardiogr.am/heart/users/beats/new

Headers
  Authorization: Bearer <ACCESS_TOKEN>

Body:
  [
    {"timestamp": <UTC timestamp in milliseconds>, "heartRate": <integer heart rate>}
  ]
```

The response will be an empty JSON map, or, if there is an error, a JSON map with a single "error" field:
```
  {}
```


## Posting step count data: /oauth/users/steps/new

Post step counts -- which, unlike heart rate data, include both a start and end tiem -- using
the /users/steps/new URI:

```
POST https://cardiogr.am/heart/users/steps/new

Headers
  Authorization: Bearer <ACCESS_TOKEN>

Body:
  [
    {"start": <UTC timestamp in milliseconds>, "end": <UTC timestamp in milliseconds", "steps": <integer step count>}
  ]
```

The response will be an empty JSON map, or, if there is an error, a JSON map with a single "error" field:
```
  {}
```

## Posting covariates

In order to generate risk scores, we require a certain set of covariates -- age, sex,
heart-rate-modifying medications like beta blockers, and so on -- that influence the way our
system interpets the user's heart rate data. You can post these via /heart/users/covariates/new:


```
POST https://cardiogr.am/heart/users/covariates/new

Headers
  Authorization: Bearer <ACCESS_TOKEN>

Body:
  {
    "year_of_birth": 1957,
    "height_inches": 65,
    "weight_lbs": 155,
    "sex": "female",
    "uses_beta_blockers": False
  }
```

The response will be an empty JSON map, or, if there is an error, a JSON map with a single "error" field:
```
  {}
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