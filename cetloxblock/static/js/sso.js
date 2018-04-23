/* mamnge sso with CET identity  */
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.js" />
function cetloAuthentication(CetDomain) {
  var _this = this;

  this.getUserInfo = function() {
    return _this.userInfo;
  }

  this.isStudent = function() {
    return this.userInfo && this.userInfo.userRole == "student";
  }

  this.authenticate = function () {
    return $.Deferred(function(dfd) {
      CetSso.getsession(function (user) {
        if (user) {
          _this.userInfo = user;
          dfd.resolve(true);
        }
        else {
          // login IDM
          //debugger;
          CET.Authentication.LogMeIn('IDM');
          dfd.resolve(false);
        }
      });
    });
  }

}
