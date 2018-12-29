---
description: >-
  Once you have your `access_token`, you may start retrieving user data from
  Cardiogram
---

# Getting User Metrics

Once you have your `access_token`, you may start retrieving user data from Cardiogram

{% api-method method="get" host="https://cardiogr.am" path="/oauth/users/:user\_id/metrics" %}
{% api-method-summary %}
Get User Metrics
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you to retrieve user weekly metrics such as their average heart rate and step count.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
`/oauth/users/1/metrics`
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
    '2017-03-01': {RESTING_BPM: 76, STEPS: 9121, MOVE: 310, SLEEP_BPM: 52},
    '2017-03-02': {RESTING_BPM: 74, STEPS: 13733, MOVE: 491, SLEEP_BPM: 51},
    ...
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

