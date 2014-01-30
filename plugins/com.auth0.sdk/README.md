## Usage

1. Install the plugin executing the following at the command line:
	
	~~~
	phonegap local plugin add https://github.com/auth0/phonegap-auth0.git
	~~~

2. Enable the plugin within your PhoneGap application by adding this line to the `www/config.xml` file:

	~~~xml
	<plugin name="Auth0Client" value="com.auth0.sdk" />
	~~~
	
	Alternatively, you can ignore step #1 and include the following element to your `www/config.xml` file:

	~~~xml
	<gap:plugin name="com.auth0.sdk" />
	~~~

3. Make sure to include the <a target="_new" href="http://jquery.com/download/">jQuery</a> library:

	~~~javascript
	<script type="text/javascript" src="js/jquery.min.js"></script>
	~~~
	
4. Instantiate Auth0Client:

	~~~javascript
	var auth0 = new Auth0Client(
		"YOUR_AUTH0_DOMAIN", // e.g.: "mytenant.auth0.com"
		"YOUR_CLIENT_ID");
	~~~

5. Trigger login (with Widget):

	~~~javascript
	auth0.login(function (err, result) {
		if (err) return err;
		/* 
		Use result to do wonderful things, e.g.: 
  		- get user email => result.profile.email
  		- get facebook/google/twitter/etc access token => result.profile.identities[0].access_token
  		- get Windows Azure AD groups => result.profile.groups
  		- etc.
		*/
	});
	~~~

	Or you can use the connection as a parameter (e.g. here we login with a Windows Azure AD account):
	
	~~~javascript
	auth0.login({ connection: "auth0waadtests.onmicrosoft.com" }, function (err, result) {
		if (err) return err;
		/* 
		Use result to do wonderful things, e.g.: 
			- get user email => result.profile.email
			- get facebook/google/twitter/etc access token => result.profile.identities[0].access_token
			- get Windows Azure AD groups => result.profile.groups
			- etc.
		*/
	});
	~~~
	
	Or with specific user name and password (only for providers that support this):
	
	~~~javascript
	auth0.login({ connection: "my-db-connection", username: "username", password: "password" }, function (err, result) {
		if (err) return err;
		/* 
		Use result to do wonderful things, e.g.: 
			- get user email => result.profile.email
			- get facebook/google/twitter/etc access token => result.profile.identities[0].access_token
			- get Windows Azure AD groups => result.profile.groups
			- etc.
		*/
	});
	~~~

### Scope

Optionally you can specify the `scope` parameter. There are two possible values for scope today:

* __scope: "openid"__ _(default)_ - It will return, not only the `access_token`, but also an `id_token` which is a Json Web Token (JWT). The JWT will only contain the user id.
* __scope: "openid profile"__ - If you want the entire user profile to be part of the `id_token`.

### Delegation Token Request

You can obtain a delegation token specifying the ID of the target client (`targetClientId`) and, optionally, an object (`options`) in order to include custom parameters like scope or id_token:

~~~js
var targetClientId = "{TARGET_CLIENT_ID}";
var options = {
    "scope": "openid profile",		// default: openid
    "id_token": "USER_ID_TOKEN"		// default: id_token of the authenticated user (client.getCurrentUser().idToken)
};

auth0.getDelegationToken(targetClientId, options, function (err, delegationResult) {
	// Call your API using delegationResult.id_token
});
~~~

## License

The MIT License (MIT)

Copyright (c) 2013 AUTH10 LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter**, or enterprise identity systems like **Windows Azure AD, Google Apps, AD, ADFS or any SAML Identity Provider**. 
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](http://developers.auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.
