var express = require('express');
var path = require('path');
var request = require('request').defaults({jar: true});

function SimpleServer(clientSecret) {
  this.baseUri = 'https://cardiogr.am';
  this.clientId = 'CardiogramConnectDemo_Prod';  // must match index.html
  this.clientSecret = clientSecret;
};

/**
 * Starts a tiny server to handle the redirect URI, and once we receive the auth code, we POST it to
 * /oauth/token to get access and refresh tokens.
 */
SimpleServer.prototype.startServer = function(port, cb) {
  var self = this;
  this.server = express();

  this.server.use(express.static(path.join(__dirname, 'public/')))

  // The initial HTML page that directs the user to https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>&redirect_uri=<YOUR_REDIRECT_URI>/&scope=cardiograms
  this.server.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'index.html'));
  });

  // The below snippet of code shows you to exchange the auth code for an auth token.
  this.server.get('/oauth/callback', function(req, res) {
    console.log('Received auth code...');
    var code = req.query.code;
    if (!!req.query.error) {
      res.json({message: 'Error in redirect: ' + req.query.error});
    } else if (!code || typeof(code) !== 'string') {
      res.json({message: 'Error, invalid auth code: '});
    }
    self.exchangeAuthCodeForTokens(code, (err, accessToken, refreshToken) => {
      console.log('Received auth tokens...');
      if (!!err) {
        res.json({message: 'Error exchanging code for tokens', err: JSON.stringify(err)});
      } else {

        self.refreshAccessToken(refreshToken, (err, accessToken) => {
          console.log('refreshed, err=' + err + ' at=' + accessToken);
        });
        return;

        self.getMetrics(accessToken, (err, metrics) => {
          console.log('Received response from metrics endpoint...');
          console.log(err);
          console.log(metrics);
          if (!!err) {
            res.json({message: 'Error reaching API', err: err})
          } else if (!!metrics.err) {
            res.json({message: 'Error from API', err: metrics.err})
          } else {
            res.json({message: 'Success! Everything is working.', metrics: metrics});
          }
        });
      }
    });
  });

  this.server.listen(port, cb);
};

/**
 * Exchanges the temporary auth code for access and refresh tokens.
 */
SimpleServer.prototype.exchangeAuthCodeForTokens = function(authCode, cb) {
  var authorizationHeader = 'Basic ' + this._base64Encode(this.clientId + ':' + this.clientSecret);
  request.post({
    url: this.baseUri + '/heart/oauth/token',
    headers: {
      Authorization: authorizationHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: authCode,
    },
  }, (err, httpResponse, body) => {
    if (!!err) {
      console.log(err);
      return cb(err);
    } else if (httpResponse.statusCode !== 200) {
      console.log('non-200 status code: ' + httpResponse.statusCode + ': ' + JSON.stringify(body));
      return cb(new Error('HTTP code ' + httpResponse.statusCode + ': ' + JSON.stringify(body)));
    } else {
      tokens = JSON.parse(body)
      return cb(null, tokens['access_token'], tokens['refresh_token']);
    }
  });
};

/**
 * Get a new accessToken, given a refreshToken that was previously obtained via
 * exchangeAuthCodeForTokens.
 */
SimpleServer.prototype.refreshAccessToken = function(refreshToken, cb) {
  var authorizationHeader = 'Basic ' + this._base64Encode(this.clientId + ':' + this.clientSecret);
  request.post({
    url: this.baseUri + '/heart/oauth/token',
    headers: {
      Authorization: authorizationHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    },
  }, (err, httpResponse, body) => {
    if (!!err) {
      console.log(err);
      return cb(err);
    } else if (httpResponse.statusCode !== 200) {
      console.log('non-200 status code: ' + httpResponse.statusCode + ': ' + JSON.stringify(body));
      return cb(new Error('HTTP code ' + httpResponse.statusCode + ': ' + JSON.stringify(body)));
    } else {
      tokens = JSON.parse(body)
      console.log('== tokens ==');
      console.log(tokens);
      return cb(null, tokens['access_token']);
    }
  });
};

/**
 * Get a JSON map of the user's metrics.
 */
SimpleServer.prototype.getMetrics = function(accessToken, cb) {
  var nowMillis = Date.now();
  var lastWeekMillis = nowMillis - 7 * 86400 * 1000;

  request.get({
    url: this.baseUri + '/heart/oauth/metrics/' + lastWeekMillis + '-' + nowMillis,
    headers: {
      Authorization: 'Authorization: Bearer ' + accessToken,
    }
  }, (err, httpResponse, body) => {
    if (!!err) {
      return cb(err);
    } else if (httpResponse.statusCode !== 200) {
      return cb(new Error('HTTP code ' + httpResponse.statusCode + ': ' + JSON.stringify(body)));
    } else {
      return cb(null, JSON.parse(body));
    }
  });
};

SimpleServer.prototype._base64Encode = function(string) {
  return new Buffer(string).toString('base64');
};

// If this file is running as main, then start the server
if (process.argv[1].indexOf('simple-server.js') > 0) {
  if (!process.env.CLIENT_SECRET || !process.env.PORT) {
    console.log('You must provide PORT and CLIENT_SECRET env variables.');
    return;
  }
  new SimpleServer(process.env.CLIENT_SECRET).startServer(process.env.PORT, (err) => {
    if (!!err) {
      console.log(err);
    } else {
      console.log('Server is running at 127.0.0.1:' + process.env.PORT);
    }
  });
}