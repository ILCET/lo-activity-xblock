/* manage sso with CET identity  */
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.js" />
/// <reference path="env-manager.js" />
(function () {
  function loadScript(url) {
    return $.Deferred(function (dfd) {
      var scriptElm = document.createElement("script");
      scriptElm.src = url;
      document.head.appendChild(scriptElm);
      scriptElm.onload = function () {
        dfd.resolve();
      }
    });
  }

  // set window.CetSSOEnvironment before loading sso scripts in order to override sso env auto-detection by url default patterns
  window.CetSSOEnvironment = CetEnvManager.getEnv();
  // load sso scripts
  var cetSsoUrl = 'https://ebag' + CetEnvManager.getCetDomain() + '/CetSso.js';
  var cetIdmUrl = 'https://login' + CetEnvManager.getCetDomain() + '/Scripts/login.js';
  if (CetEnvManager.getEnv() == "testing") {
    cetIdmUrl = cetIdmUrl.replace('login.testing','testing.login');
  }
  window.cetSsoPromise = $.when(loadScript(cetIdmUrl), loadScript(cetSsoUrl));
})();

function cetloAuthentication(CetDomain) {
  var _this = this;

  this.getUserInfo = function() {
    return _this.userInfo;
  }

  this.isStudent = function() {
    return this.userInfo && this.userInfo.userRole == "student";
  }

  this.authenticate = function () {
    return $.Deferred(function (dfd) {
      window.cetSsoPromise.done(function () {
        CetSso.getsession(function (user) {
          if (user) {
            _this.userInfo = user;
            dfd.resolve(true);
          }
          else {
            // login IDM
            var returnUrl = window.location.href;
            CET.Authentication.LogMeIn('IDM', returnUrl, returnUrl);
            dfd.resolve(false);
          }
        });
      });
    });
  }

}
