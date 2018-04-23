/* Javascript for CetLoXBlock - studio view. */
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.js" />
/// <reference path="http://underscorejs.org/underscore.js" />
/// <reference path="services.js" />
function CetLoXBlock(runtime, element) {

  // TODO: use selector-plugin method instead
  function PLUGIN_showSelection(id, language) {
    var $selected = $(element).find('.cet-lo-item[data-cet-lo-item-id=' + id + '][data-cet-lo-item-language=' + language + ']');

    if ($selected.length > 0) {
      PLUGIN_select($selected[0]);
    }
  }
  // TODO: will not be needed with selector-plugin
  function PLUGIN_select(selectedElement) {
    $(selectedElement).siblings().removeClass('cet-lo-selected');
    $(selectedElement).addClass('cet-lo-selected');

    //selectedElement.scrollIntoView();
    var $list = $('.cet-lo-list', element);
    if (selectedElement.offsetTop > $list[0].scrollTop + $list[0].offsetHeight) {
      $list[0].scrollTop = selectedElement.offsetTop;
    }
  }

  function bindListEvents() {
    // TODO: bind to selector-plugin event and call onItemSelection()
    $('li.cet-lo-item', element).click(function (eventObject) {
      var selected = this;
      PLUGIN_select(selected);

      onItemSelection(selected.dataset.cetLoItemId, selected.dataset.cetLoItemLanguage, $('.cet-lo-item-title', selected).text());
    });
    $('.cet-lo-item-link', element).click(function (eventObject) {
      eventObject.stopPropagation();
    });
  }

  function initServices() {
    var cetdomain = $('.cet-domain', element).val();
    this.services = new CetServices(cetdomain);
  }

  function renderList() {
    var _this = this;
    return $.Deferred(function (dfd) { 
      _this.services.getCourseSettings().done(function (settings) {
        //console.debug(settings);
        services.getCourseItemList(settings).done(function (list) {
          //console.debug(list);
          htmlList = "";
          var itemTemplate = $('.cet-lo-item-template', element).html();
          var compiled = _.template(itemTemplate);
          var linkCompiled = _.template("//lo<%=cetdomain%>/player/?document=<%=id%>&language=<%=language%>&sitekey=ebag#options=nobar");
          for (var i = 0; i < list.length; i++) {
            item = list[i];
            item.cetdomain = settings.cetDomain;
            item.link = linkCompiled(item);
            htmlList += compiled(item);
          }
          var $list = $('.cet-lo-list', element);
          $list.html(htmlList);
          dfd.resolve();
        }).fail(function (response) {
          throw response;
        });
      }).fail(function (response) {
        throw response;
      });
    });
  }

  function initSelected() {
    var id = $('.cet-lo-selected-id', element).val();
    var language = $('.cet-lo-selected-language', element).val();
    if (id && language) {
      PLUGIN_showSelection(id, language);
    }
  }

  function onItemSelection(documentid, language, title) {
    $('.cet-lo-selected-id', element).val(documentid);
    $('.cet-lo-selected-language', element).val(language);
    $('.cet-lo-selected-title', element).val(title);
  }

  var handlerUrl = runtime.handlerUrl(element, 'select_LO');
  var save_button = $('.save-button', element);
  var cancel_button = $('.cancel-button', element);

  save_button.unbind('click').bind('click', function() {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
    var data = {
      documentid: $('.cet-lo-selected-id', element).val(),
	  language: $('.cet-lo-selected-language', element).val(),
	  title: ($('.cet-lo-selected-title', element).val()),
    };
    runtime.notify('save', {state: 'start'});
    $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
      if (response.result === 'success') {
        runtime.notify('save', {state: 'end'});
      }
    });	  
  });
  
  cancel_button.unbind('click').bind('click', function() {
    runtime.notify('cancel', {});
  });

  $(function ($) {
    if (window.debugmode) debugger;
    initServices();

    renderList().done(function () {
      bindListEvents();
      initSelected();
    });

  });
}
