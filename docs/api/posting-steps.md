---
description: >-
  Once you have your `access_token`, you may start passing user data to
  Cardiogram for us to generate Risk Scores.
---

# Posting Steps

Once you have your `access_token`, you may start adding user data to Cardiogram in order to generate Risk Scores

{% api-method method="post" host="https://cardiogr.am" path="/heart/oauth/users/:userId/steps" %}
{% api-method-summary %}
Add step count data to user
{% endapi-method-summary %}

{% api-method-description %}
The steps endpoint helps store user step count
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="userId" type="string" required=true %}
`/oauth/users/1/steps`
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=true %}
`Bearer <access_token>`
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="Steps" type="object" required=true %}
`{   
  steps: <Array>[  
    {   
      start: <Timestamp>     
      end: <Timestamp>  
      value: <Float>  
    }  
  ]  
}`   
  
_Timestamps are UTC time in seconds_
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Steps successfully saved.
{% endapi-method-response-example-description %}

```javascript
{ "success": true }
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=400 %}
{% api-method-response-example-description %}
Couldn't parse body content
{% endapi-method-response-example-description %}

```javascript
// One of the following messages:
{ "message": "Malformed input." }
{ "message": "Step values contain negative value." }
{ "message": "Timestamps ('start' or 'end') are not in UNIX seconds" }
{ "message": "End time greater than start time for a step data point." }
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

## Code Sample:

{% tabs %}
{% tab title="cURL" %}
```bash
curl --location --request POST "https://cardiogr.am/heart/oauth/users/1/steps" \
  --header "Content-Type: application/json" \
  --data "{ \"steps\": [{ \"start\": 1546025622, \"end\": 1546025820, \"value\": 105 }] }"
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
var settings = {
  "url": "https://cardiogr.am/heart/oauth/users/1/steps",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Content-Type": "application/json"
  },
  "data": "{ \"steps\": [{ \"start\": 1546025622, \"end\": 1546025820, \"value\": 105 }] }",
};
$.ajax(settings).done(function (response) {
  console.log(response);
});
```
{% endtab %}

{% tab title="Python" %}
```python
import requests
url = 'https://cardiogr.am/heart/oauth/users/1/steps'
payload = "{ \"steps\": [{ \"start\": 1546025622, \"end\": 1546025820, \"value\": 105 }] }"
headers = {
  'Content-Type': 'application/json'
}
response = requests.request('POST', url, headers = headers, data = payload, allow_redirects=False, timeout=undefined, allow_redirects=false)
print(response.text)
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require "uri"
require "net/http"

url = URI("https://cardiogr.am/heart/oauth/users/1/steps")

http = Net::HTTP.new(url.host, url.port)

request = Net::HTTP::Post.new(url)
request["Content-Type"] = "application/json"
request.body = "{ \"steps\": [{ \"start\": 1546025622, \"end\": 1546025820, \"value\": 105 }] }"

response = http.request(request)
puts response.read_body
```
{% endtab %}

{% tab title="PHP" %}
```php
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://cardiogr.am/heart/oauth/users/1/steps",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => false,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>"{ \"steps\": [{ \"start\": 1546025622, \"end\": 1546025820, \"value\": 105 }] }",
  CURLOPT_HTTPHEADER => array(
    "Content-Type: application/json"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
} ?>
```
{% endtab %}

{% tab title="Go" %}
```go
package main

import (
  "fmt"
  "strings"
  "os"
  "path/filepath"
  "net/http"
  "io/ioutil"
)

func main() {

  url := "https://cardiogr.am/heart/oauth/users/1/steps"
  method := "POST"

  payload := strings.NewReader("{ \"steps\": [{ \"start\": 1546025622, \"end\": 1546025820, \"value\": 105 }] }")

  client := &http.Client {
    CheckRedirect: func(req *http.Request, via []*http.Request) error {
      return http.ErrUseLastResponse
    },
  }
  req, err := http.NewRequest(method, url, payload)

  if err != nil {
    fmt.Println(err)
  }
  req.Header.Add("Content-Type", "application/json")

  res, err := client.Do(req)
  defer res.Body.Close()
  body, err := ioutil.ReadAll(res.Body)

  fmt.Println(string(body))
}
```
{% endtab %}
{% endtabs %}

