# Cardiogram Connect

API Documentation and example code for Cardiogram Connect. If you're here, you're likely an
integration partner -- welcome! We're excited to work with you. Feel free to email
connect@cardiogr.am with any questions.


## Getting Started

You should have received a client id and client secret from us, likely for both your development
and production environments. Note that each client id and client secret will only work with a
particular redirect URI on your system. If you need to support additional testing redirect URIs,
please email connect@cardiogr.am.


## User Authentication and Consent with OAuth 2

Users explicitly choose to share data via a dialog that explains what they're sharing and
with whom, similar to the Facebook Connect or "Sign in with Twitter" APIs. To obtain the user's consent,
send them to the auth URL with your client id and redirect URI:

  `https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>&redirect_uri=<YOUR_REDIRECT_URI>/&scope=cardiograms`

If the user clicks on "Yes, Share my data," you'll receive an temporary auth code as a parameter
to your redirect URI:

  `https://your.redirect.uri/goes/here?code=XXXXXXXXXX`

You can then exchange that **auth code** for **access and refresh tokens** by posting to the
/oauth/token URI. Note that your OAuth2 library may abstract the below token exchange process,
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

## Basic User Info: /oauth/basic_info
Once you have an access token, you can get basic profile information, such as the user's timezone
by issuing an HTTP get request to /oauth/basic_info:

```
GET https://cardiogr.am/oauth/basic_info

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

Response:
```
  {
  	native_user_id: 8100
  }
```


## Metrics: /oauth/metrics
Get the contents of the user's metrics pane--including resting heart rate, step counts, etc.--with
the /oauth/metrics URI:

```
GET https://cardiogr.am/oauth/basic_info

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

You can see example code in simple-server.js. To run the server, run this command in your terminal:
`CLIENT_SECRET=<YOUR_CLIENT_SECRET> PORT=9000 node simple-server.js`