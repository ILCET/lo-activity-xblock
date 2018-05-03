/* find CET environment  */
var CetEnvManager = {
  getEnv: function () {
    var host = window.location.host.toLowerCase();
    if (host.indexOf("localhost") >= 0 || host.indexOf("127.0.0.1") >= 0) {
      return "dev";
    }
    if (host.indexOf('campus-dev.') >= 0) {
      return "testing";
    }
    return "prod";
  },
  getCetDomain: function () {
    domainsMap = {
      "dev": ".dev.cet.ac.il",
      "testing": ".testing.cet.ac.il",
      "prod": ".cet.ac.il"
    };
    return domainsMap[CetEnvManager.getEnv()];
  }
}
