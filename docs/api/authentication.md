# Authentication

There are 2 ways to onboard a user to the Cardiogram platform through Cardiogram Connect. You can either:

1. Direct the user to [Cardiogram Connect's OAuth url](https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>) which allows them to consent to data sharing \(Similar to the "Sign in with Google"\) 
2. Create a new Cardiogram user through the API

## User Authentication and Consent with OAuth 2

Data sharing through the OAuth2 flow allows the users explicitly choose to share data via a dialog that explains what they're sharing and with whom.

If you're creating a new user and sending them to Cardiogram to connect, then, as part of getting you set up, we'll check that correct language is in place for your company's terms of service, privacy policy, and user interface.

### Implementation

To obtain the user's consent, send them to the auth URL with your client id:

`https://cardiogr.am/auth?response_type=code&client_id=<YOUR_CLIENT_ID>`

The user is then prompted to connect with their Cardiogram account and is then shown a dialog giving them the choice of whether to share their data.

If the user clicks on "Yes, Share my data," you'll receive an temporary auth code as a parameter to your redirect URI:

`https://your.redirect.uri/cardiogram/callback?code=XXXXXXXXXX`

{% hint style="info" %}
As part of getting you onboarded, we will set up your redirect URI with you
{% endhint %}

The next step is then to [exchange the temporary auth code](authentication.md#exchanging-an-auth-code-for-oauth2-tokens) for OAuth 2 access tokens that can be used in subsequent API calls.

## Creating a new Cardiogram user via API

The alternative is to create a Cardiogram account on behalf of your user. To do this, you need a unique identifier used by your system and the users' email.

### Implementation

{% api-method method="post" host="https://cardiogr.am" path="/heart/oauth/users/new" %}
{% api-method-summary %}
Create a new Cardiogram User
{% endapi-method-summary %}

{% api-method-description %}
This method will create a new Cardiogram user
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Content-Type" type="string" required=true %}
`application/x-www-form-urlencoded`
{% endapi-method-parameter %}

{% api-method-parameter name="Authorization" type="string" required=true %}
Basic Auth  
`Basic <Base64-encoded client_id:client_secret>`
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="email" type="string" required=false %}
Email address of the user  
`kai@cardiogr.am`
{% endapi-method-parameter %}

{% api-method-parameter name="memberId" type="string" required=false %}
Unique identifier with your system  
`kai123`
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```javascript
{
    userId: '1', // <String> Cardiogram User ID
    code: 'auth_code' // <String> Your `auth_code` used to exchange for auth tokens
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```javascript
{ message: "Credentials not valid / missing fields in header." }
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% hint style="info" %}
 Note that the `Content-Type` for authentication related endpoints is`application/x-www-form-urlencoded` as opposed to `JSON.`

`Authorization is done via basic auth.`
{% endhint %}

The next step is then to [exchange the temporary auth code](authentication.md#exchanging-an-auth-code-for-oauth2-tokens) for OAuth 2 access tokens that can be used in subsequent API calls.

## Exchanging an auth code for OAuth2 tokens

To exchange the **auth code** for **access and refresh tokens**, post to the `/oauth/token` URI. 

Note that your OAuth2 library may abstract the below token exchange process, but if you need to implement it explicitly, then make an HTTP Post similar to the below:

{% api-method method="post" host="https://cardiogr.am" path="/heart/oauth/token" %}
{% api-method-summary %}
Retrieve access and refresh tokens 
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Content-Type" type="string" required=false %}
`application/x-www-form-urlencoded`
{% endapi-method-parameter %}

{% api-method-parameter name="Authorization" type="string" required=false %}
Basic Auth  
`Basic <Base64-encoded client_id:client_secret>`
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="code" type="string" required=false %}
Your auth\_code from above  
`auth_code`
{% endapi-method-parameter %}

{% api-method-parameter name="grant\_type" type="string" required=false %}
`authorization_code`
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```javascript
{
    token_type: "bearer", // <String>
    access_token: "access_token", // <String>
    refresh_token: "refresh_token", // <String>
    expires_in: 1547163941452 // <Number>
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```javascript
{ message: "Credentials not valid / missing fields in header." }
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

You can now use the `access_token` on any of the following API endpoints on behalf of that particular user.

