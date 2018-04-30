/* Javascript for CetLoXBlock - student view */
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.js" />
/// <reference path="sso.js" />
/// <reference path="services.js" />
function CetLoXBlock(runtime, element) {

  var _this = this;

  function initializeServices() {
    var courseEdxName = ($(element).data('course-id') || '').split(':').pop();
    _this.services = new CetServices(courseEdxName);
    var cetdomain = _this.services.CetDomain;
    _this.sso = new cetloAuthentication(cetdomain);
  }

  function getLoInfo() {
    return {
      documentId: $('.cet-lo-document-id', element).val(),
      language: $('.cet-lo-language', element).val(),
    }
  }

  function getTaskId() {
    return $('.cet-lo-task-id', element).val();
  }

  function saveTaskId(taskId) {
    $.post(saveTaskHandlerUrl, JSON.stringify({ taskid: taskId }));
  }

  function initializeTask(userInfo) {
    return $.Deferred(function (dfd) {
      _this.services.getCourseSettings().done(function (courseSettings) {
        _this.services.getUserCourses(userInfo, courseSettings).done(function (userCourses) {
          if (userCourses.length > 0) {
            _this.services.getCreateTask(getLoInfo(), courseSettings, userCourses[0].audienceId).done(function (taskId) {
              dfd.resolve(taskId);
              saveTaskId(taskId);
            });
          }
          else {
            dfd.resolve("");
          }
        });
      });
    });
  }

  function initializePlayerVars() {
    _this.$playerFrame = $('.cet-lo-player', element);
    _this.itemPlayerUrlTemplate = $('.cet-lo-item-template', element).val().replace("{cetdomain}", _this.services.CetDomain);
    _this.taskPlayerUrlTemplate = $('.cet-lo-task-template', element).val().replace("{cetdomain}", _this.services.CetDomain);
  }

  function unloadPlayer() {
    loadPlayer('about:blank');
  }
  function loadPlayer(url) {
    _this.$playerFrame.attr('src', url);
  }

  function loadTaskPlayer(taskId) {
    var url = _this.taskPlayerUrlTemplate.replace('{taskid}', taskId);
    loadPlayer(url);
  }
  function loadItemPlayer(itemId) {
    var url = _this.itemPlayerUrlTemplate.replace('{itemid}', itemId);
    loadPlayer(url);
  }

  // bind to grade messages from cet lo
  window.addEventListener('message', function (e) {
    if (e.data["cet.lo"]) {
      var loData = e.data["cet.lo"];
      var gradeData = {
        grade: loData.score,
        weight: loData.weight || 1.0
      };
      $.post(gradeHandlerUrl, JSON.stringify(gradeData));
    }
  });

  var saveTaskHandlerUrl = runtime.handlerUrl(element, 'save_taskid');
  var gradeHandlerUrl = runtime.handlerUrl(element, 'publish_grade');

  $(function () {
    if (window.debugmode) debugger;
    initializeServices();
    _this.sso.authenticate().done(function (authenticated) {
      if (authenticated) {
        initializePlayerVars();
        var taskId = getTaskId();
        if (taskId) {
          loadTaskPlayer(taskId);
        }
        else {
          if (_this.sso.isStudent()) {
            unloadPlayer();
            initializeTask(_this.sso.getUserInfo()).done(function (taskId) {
              if (taskId) {
                loadTaskPlayer(taskId);
              }
              else {
                loadItemPlayer(getLoInfo().documentId);
              }
            });
          }
          else {
            loadItemPlayer(getLoInfo().documentId);
          }
        }
      }
    });
  });
}

