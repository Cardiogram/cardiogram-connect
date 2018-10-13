/**
 * Simple Node.js server that hosts the callback endpoints to connect with the
 * Cardiogram API.
 */
const path = require('path');
/**
 * Express is used to create our http server.
 *  (https://expressjs.com/)
 */
const express = require('express');
/**
 * Axios will issue http requests against the Cardiogram endpoints.
 *  (https://github.com/axios/axios)
 */
const axios = require('axios');

// Define our constants.
const CARDIOGRAM_BASE_URI = 'https://cardiogr.am';
const CLIENT_ID = process.env.CLIENT_ID || 'CardiogramConnectDemo_Prod';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const PORT = process.env.PORT || 5000;

const server = express();
/**
 * Serve the initial "Connect with Cardiogram" HTML page.
 * By clicking on the "Connect" button, the user will be linked to "https://cardiogr.am/auth"
 * where they can log in and allow permission for this app. Cardiogram will then hit the
 * "redirect_uri" specified with the auth code.
 */
server.use(express.static(path.join(__dirname, '../../public/')));

// Define server endpoint.
/**
 * The "redirect_uri" that Cardiogram hits after the user grants permission.
 * After the user authenticated.
 *
 * Cardiogram will pass `?code=<string>&error=<string>` as parameters here:
 *  code: your app `auth code` used to exchange for accessTokens
 *  error: any error messages from the Cardiogram server
 */
server.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    res.json({ message: `Error: ${error}` });
  }
  if (!code || typeof code !== 'string') {
    res.json({ message: 'Error: invalid auth code' });
  }
  // Once we retrieve the `auth code`, we can excahnge it for an accessToken which is used
  // to request data on the users' behalf.
  const { refreshToken } = await exchangeAuthCodeForTokens(code);
  // Here's an example of refreshing your last accessToken
  const { accessToken } = await refreshAccessToken(refreshToken);
  // Let's use this new accessToken to now get some metrics for this user.
  const metrics = await getMetrics(accessToken);

  res.json({ message: 'Success! Everything is working.', metrics });
});

/**
 * This function will make an HTTP request to Cardiogram Connect's `/oauth/token` endpoint
 * to retrieve the accessToken given a `auth code`.
 *
 * @param  {String} code - `auth code` the Cardiogram server passes to the callback uri.
 * @return {Promise} - resolves with { accessToken, refreshToken }
 */
function exchangeAuthCodeForTokens(code) {
  const authorizationHeader = `Basic ${base64Encode(
    `${CLIENT_ID}:${CLIENT_SECRET}`,
  )}`;
  const requestHeaders = {
    Authorization: authorizationHeader,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const requestBody = {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
  };
  return (
    axios
      .post(`${CARDIOGRAM_BASE_URI}/heart/oauth/token`, requestBody, {
        headers: requestHeaders,
      })
      // Axios response schema (https://github.com/axios/axios#response-schema), it will also
      // automatically parse the JSON response.
      .then((response) => {
        // We want to grab the Cardiogram response which is nested inside Axios' 'data' key.
        // Cardiogram will respond with the JSON:
        //  { access_token, refresh_token }
        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
      })
  );
}

/**
 * This function will refresh your `accessToken` given the `refreshToken`. It's useful
 * for when you need to reauthenticate with Cardiogram given that accessTokens only last
 * a certain duration.
 *
 * @param  {String} refreshToken
 * @return {Promise} - resolves with { accessToken }
 */
function refreshAccessToken(refreshToken) {
  const authorizationHeader = `Basic ${base64Encode(
    `${CLIENT_ID}:${CLIENT_SECRET}`,
  )}`;
  const requestHeaders = {
    Authorization: authorizationHeader,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const requestBody = {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
  };
  return axios
    .post(`${CARDIOGRAM_BASE_URI}/heart/oauth/token`, requestBody, {
      headers: requestHeaders,
    })
    .then((response) => ({ accessToken: response.data.access_token }));
}

/**
 * Get the users' metrics given the access token.
 * @param  {String} accessToken
 * @return {Promise} - resolves with user metrics
 */
function getMetrics(accessToken) {
  const nowMillis = Date.now();
  const lastWeekMillis = nowMillis - 7 * 86400 * 1000;
  const requestUri = `${CARDIOGRAM_BASE_URI}/heart/oauth/metrics/${nowMillis}-${lastWeekMillis}`;
  const requestHeaders = {
    Authorization: `Authorization: Bearer ${accessToken}`,
  };
  return axios
    .get(requestUri, { headers: requestHeaders })
    .then((response) => response.data);
}

/**
 * Helper method to encode string to base64.
 */
function base64Encode(string) {
  return Buffer.from(string).toString('base64');
}

// Start the http server.
if (CLIENT_SECRET) {
  server.listen(PORT, () => {
    console.log('Server started on port', PORT);
  });
} else {
  throw new Error(
    'Please make sure your CLIENT_SECRET is specified in your environment variables',
  );
}
