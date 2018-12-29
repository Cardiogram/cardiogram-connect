---
description: >-
  Once you have your `access_token`, you may start retrieving user data from
  Cardiogram
---

# Getting Risk Scores

Once you have your `access_token`, you may start retrieving user data from Cardiogram

{% api-method method="get" host="https://cardiogr.am" path="/oauth/users/:user\_id/risk\_scores" %}
{% api-method-summary %}
Get User Risk Scores
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you to retrieve basic user info including covariates
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
`/oauth/users/1/risk_scores`
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
[
  {
    modelVersion: // <String> ('1.0.0')
    score: // <Float> Risk score percentile compared across all available users (80.0)
    condition: // <Enum> ('diabetes' | 'sleepApnea' | 'hbp' | 'afib')
    predictionTime: // <Timestamp>
    segmentStart: // <Timestamp>
    segmentEnd: // <Timestamp>
  }
  ...
]
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% hint style="info" %}
_Response Timestamps are in UTC seconds_
{% endhint %}



