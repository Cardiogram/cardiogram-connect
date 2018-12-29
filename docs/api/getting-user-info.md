---
description: >-
  Once you have your `access_token`, you may start retrieving user data from
  Cardiogram
---

# Getting User Info

{% api-method method="get" host="https://cardiogr.am" path="/oauth/users/:user\_id/basic\_info" %}
{% api-method-summary %}
Get User Info
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you to retrieve basic user info including covariates
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
/oauth/users/1/`basic_info`
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=true %}
`Bearer <access_token>`
{% endapi-method-parameter %}
{% endapi-method-headers %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Cake successfully retrieved.
{% endapi-method-response-example-description %}

```javascript
{ 
  "dateOfBirth": "" // <String> (YYYY-MM-DD)
  "height": "175" // <String>
  "heightUnit": "cm" // <Enum> ("cm" | "ft/in")
  "weight": "65" // <String>
  "weightUnit": "kg" // <Enum> ("lb" | "kg")
  "sex": "Male" // <Enum> ("Male" | "Female")
  "isOnBetaBlocker": false // <Boolean>
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}



