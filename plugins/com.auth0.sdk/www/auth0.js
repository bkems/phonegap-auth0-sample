function Auth0Client(domain, clientId) {

  // validations
  if (!$) throw new Error('You must include jquery to use Auth0 plugin');

  this.AuthorizeUrl           = "https://{domain}/authorize";
  this.LoginWidgetUrl         = "https://{domain}/login/";
  this.ResourceOwnerEndpoint  = "https://{domain}/oauth/ro";
  this.DelegationEndpoint     = "https://{domain}/delegation";
  this.UserInfoEndpoint       = "https://{domain}/userinfo?access_token=";
  this.DefaultCallback        = "https://{domain}/mobile";

  this.domain = domain;
  this.clientId = clientId;
}

Auth0Client.prototype.login = function (options, callback) {

  if (typeof options === 'function') {
      callback = options;
      options = {};
  }

  if (!options) options = {};
  if (!callback) callback = function () { };

  var setLocalStorage = this._setLocalStorage;
  var parseResult = this._parseResult;
  var getUserInfo = this._getUserInfo;
  var userInfoEndpoint = this.UserInfoEndpoint.replace(/{domain}/, this.domain);

  // defaults
  options.scope = options.scope ? encodeURI(options.scope) : "openid";
  options.connection = options.connection || '';

  // done
  var done = function (err, result) {
    if (err) return callback(err);

    var endpoint = userInfoEndpoint + result.access_token;
    getUserInfo(endpoint, function (err, profile) {
      if (err) return callback(err);

      var auth0User = {
        auth0AccessToken: result.access_token,
        idToken: result.id_token,
        profile: profile
      };

      // persist user
      setLocalStorage('auth0User', auth0User);

      return callback(null, auth0User);
    });
  };

  if (options.connection && options.username) {
    // RO endpoint
    var endpoint = this.ResourceOwnerEndpoint.replace(/{domain}/, this.domain);

    $.post(endpoint, {
      "client_id":      this.clientId,
      "connection":     options.connection,
      "username":       options.username,
      "password":       options.password,
      "scope":          options.scope,
      "grant_type":     'password'
    })
    .done(function (result) {
      done(null, result);
    })
    .fail(function (resp) {
      var message = resp.responseJSON ? 
        resp.responseJSON.error + ': ' + resp.responseJSON.error_description :
        resp.responseText;
      done(new Error(message));
    });
  }
  else {
    
    var authorizeUrl = this.AuthorizeUrl.replace(/{domain}/, this.domain);
    var loginWidgetUrl = this.LoginWidgetUrl.replace(/{domain}/, this.domain);
    var callbackUrl = this.DefaultCallback.replace(/{domain}/, this.domain);

    authorizeUrl += "?client_id=" + this.clientId + "&redirect_uri=" + callbackUrl + "&response_type=token&scope=" + options.scope + "&connection=" + options.connection;
    loginWidgetUrl += "?client=" + this.clientId + "&redirect_uri=" + callbackUrl + "&response_type=token&scope=" + options.scope;

    var auth0Url = options.connection ? authorizeUrl : loginWidgetUrl;

    var authWindow = window.open(options.connection ? auth0Url : loginWidgetUrl, '_blank', 'location=no,toolbar=no');
    authWindow.addEventListener('loadstart', function (e) {

      if (e.url.indexOf(callbackUrl + '#') !== 0) return;
      
      var parsedResult = parseResult(e.url);
      authWindow.close();
      return done(null, parsedResult);
    });
  }
};

Auth0Client.prototype.getDelegationToken = function (targetClientId, options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // ensure id_token
    var currentUser = this.getCurrentUser();
    var id_token = options.id_token || currentUser ? currentUser.idToken : null;
    delete options.id_token;

    if (!id_token) {
        return callback(new Error("You need to login first or specify a value for id_token parameter."));
    }

    var endpoint = this.DelegationEndpoint.replace(/{domain}/, this.domain);
    var parameters = {
      "grant_type":     'urn:ietf:params:oauth:grant-type:jwt-bearer',
      "id_token":       id_token,
      "target":         targetClientId,
      "client_id":      this.clientId
    };

    for (var k in options) {
      if (options[k] !== undefined) {
        parameters[k] = options[k];
      }
    }

    $.post(endpoint, parameters)
    .done(function (result) {
      callback(null, result);
    })
    .fail(function (resp) {
      var message = resp.responseJSON ? 
        resp.responseJSON.error + ': ' + resp.responseJSON.error_description :
        resp.responseText;
      callback(new Error(message));
    });
};

Auth0Client.prototype.logout = function (callback) {
  this._clearLocalStorage();  
  if (callback) callback();
};

Auth0Client.prototype.getCurrentUser = function () {
  return this._getLocalStorage('auth0User');
};

Auth0Client.prototype._getLocalStorage = function (key) {
  var value = window.localStorage.getItem(key);
  return value ? JSON.parse(value) : undefined;
};

Auth0Client.prototype._setLocalStorage = function (key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
};

Auth0Client.prototype._clearLocalStorage = function () {
  window.localStorage.clear();
};

Auth0Client.prototype._getUserInfo = function (endpoint, callback) {

  $.ajax({
    url: endpoint,
    dataType: 'json'
  })
  .done(function (profile) {
    callback(null, profile);
  })
  .fail(function (resp) {
    callback(new Error(resp.responseText));
  });
};

Auth0Client.prototype._parseResult = function (result) {

  var tokens = {};
  var strTokens = result.split("#")[1].split("&");

  for (var i in strTokens) {
      var tok = strTokens[i].split("=");
      tokens[tok[0]] = tok[1];
  }

  return tokens;
};

module.exports = Auth0Client;
