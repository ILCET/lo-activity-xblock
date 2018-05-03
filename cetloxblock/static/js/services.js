/* data queries from CET for CetLoXBlock. */
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.js" />
/// <reference path="http://cdn.cet.ac.il/ui-services/login/js/cet.ui-services.login.full.js" />
/// <reference path="env-manager.js" />
function CetServices(courseEdxName) {
  function getCourseEdxName() {
    var match = /-v\d+:([^\/\+]+\+[^\/\+]+\+[^\/\+]+)[\/\+]/gi.exec(location.pathname);
    if (match.length) {
      return match[1];
    }
  }
  if (!courseEdxName) {
    courseEdxName = getCourseEdxName();
  }

  var CetDomain = this.CetDomain = CetEnvManager.getCetDomain();

  var PRODUCT_PLAYER = "https://productplayer" + CetDomain + "/";
  var PRODUCT_PLAYER_API = PRODUCT_PLAYER + "api/ApiProxy/";
  var PRODUCT_PLAYER_SERVICES = "https://productplayerservices" + CetDomain + "/";
  var TREE_SERVICE = "https://treeservice" + CetDomain + "/api/Trees/";
  var TREE_LMS_SERVICE = "https://treeservice" + CetDomain + "/api/TreeLMS/";
  var DEFAULT_CET_COURSE = "Edx-adaptive-project";


  function getCourseCetName(edxName) {
    var url = PRODUCT_PLAYER + "edxCourses.json";
    return $.Deferred(function (dfd) {
      $.get(url).done(function (response) {
        var courseObj = response[edxName];
        if (courseObj) {
          dfd.resolve(courseObj.path);
        }
        else {
          dfd.resolve(DEFAULT_CET_COURSE);
        }
      }).fail(function (response) {
        dfd.resolve(DEFAULT_CET_COURSE);
      });
    });
  }

  this.getCourseSettings = function () {
    return $.Deferred(function (dfd) {
      getCourseCetName(courseEdxName)
        .done(function (cetName) {
          var url = PRODUCT_PLAYER_SERVICES + "GetProductConfigurationByName/" + cetName;

          $.get(url)
            .done(function (response) {
              var settingsObj = {
                edxName: courseEdxName,
                cetName: response.productName,
                productId: response.productId,
                folderId: response.rootDocumentId,
                language: response.loLanguage,
                cetDomain: CetDomain,
              };
              dfd.resolve(settingsObj);
            })
            .fail(function (response) {
              dfd.reject("Failed to retrieve Cet course properties. Error: " + response);
            });
        })
        .fail(function (error) {
          dfd.reject(error);
        });
    });
  }

  // #region STUDIO SERVICES
  this.getCourseItemList = function (courseSettings) {
    var _this = this;
    if (!courseSettings) {
      return $.Deferred(function (dfd) {
        this.getCourseSettings()
        .done(function (settings) {
          _this.getCourseItemList(settings).done(function (itemList) {
            dfd.resolve(itemList);
          }).fail(function (response) {
            dfd.reject(response);
          });
        }).fail(function (response) {
          dfd.reject(response);
        });
      });
    }


    // http://treeservice.cet.ac.il/api/Trees/a2326f9f-c094-4458-95ea-e832d7273e9c/he
    var url = TREE_SERVICE + courseSettings.folderId + "/" + courseSettings.language;
    return $.Deferred(function (dfd) {
      $.get(url).done(function (response) {
        var itemList = _this.parseItemList(response);
        dfd.resolve(itemList);
      }).fail(function (response) {
        dfd.reject("Failed to retrieve item list. Error: " + response);
      });
    });


  }

  this.parseItemList = function (rawItemList) {
    var itemList = [];

    function getImageUrl(rawImageUrl)
    {
      var imageUrl = rawImageUrl;
      if (imageUrl) {
        imageUrl += '&w=56&h=56';
      }
      return imageUrl;
    }

    function parseItemListChild(child, parentFolder) {
      if (child.ParentFolder && child.ParentFolder.LeadingItem) { // adaptive Page Player
        itemList.push({
          id: child.ParentFolder.LeadingItem.Id,
          language: rawItemList.Language,
          folder: child.ParentFolder.Id,
          title: child.ParentFolder.LeadingItem.Title || child.ParentFolder.Title,
          imageUrl: getImageUrl(child.Children[0].ImageUrl),
        });
      }
      else if (child.Type == 'link') { // Stand-alone item
        itemList.push({
          id: child.Id,
          language: rawItemList.Language,
          folder: parentFolder.Id,
          title: child.Title,
          imageUrl: getImageUrl(child.ImageUrl),
        });
      }
      else {   // a folder
        for (var i = 0; i < child.Children.length; i++) {
          parseItemListChild(child.Children[i], child.ParentFolder);
        }
      }
    }

    // parse list recursively (skip root LeadingItem!)
    var root = rawItemList.FolderTree;
    for (var i = 0; i < root.Children.length; i++) {
      parseItemListChild(root.Children[i], root.ParentFolder);
    }

    return itemList;
  }
  // #endregion 

  // #region STUDENT SERVICES
  this.getUserCourses = function(userInfo, courseInfo) {
    // http://productplayer.cet.ac.il/api/ApiProxy/GetUserGroups?userId=2e290814-0f24-4e5b-b777-359db924bca0&schoolId=008dd1bf-1f8a-44d4-bd83-8e06e45a4180&productId=a2326f9f-c094-4458-95ea-e832d7273e9c
    return $.Deferred(function (dfd) {
      var url = PRODUCT_PLAYER_API + "GetUserGroups?userId=" + userInfo.userID + "&schoolId=" + userInfo.schoolID + "&productId=" + courseInfo.productId;
      $.get(url).done(function (response) {
        dfd.resolve(response);
      }).fail(function (response) {
        dfd.reject(response);
      });
    });
  }

  this.getCreateTask = function (loInfo, courseInfo, audienceId) {
    return $.Deferred(function (dfd) {
      var urlParts = [TREE_LMS_SERVICE + "CreateTaskOnTheFly"
                    , loInfo.documentId,
                    , loInfo.folderId
                    , courseInfo.productId
                    , audienceId
                    , scoreType = 0
                    , loInfo.language
                    , ((new Date).getTimezoneOffset() / 60) * (-1)
      ];
      var url = urlParts.join('/');
      $.post(url).done(function (response) {
        dfd.resolve(response.TaskId);
      }).fail(function (response) {
        dfd.reject(response);
      });
    });
  }

  // #endregion 

}
