promise = {};

promise.ajax = function(options, rejectCode){
  var dfd = $.Deferred();
  options.success = function(data){
    dfd.resolve(data);
  };
  options.error = function(XMLHttpRequest, textStatus, errorThrown){
    dfd.reject(rejectCode, {
      XMLHttpRequest: XMLHttpRequest,
      textStatus: textStatus,
      errorThrown: errorThrown,
    });
  };
  if(options.timeout === undefined){
    options.timeout = pcs_timeout;
  }
  ajax_wrapper(options);
  return dfd.promise();
};

promise.get = function(url, data, rejectCode){
  return promise.ajax(
    {
      type: 'GET',
      url: url,
      data: data,
    },
    rejectCode,
  );
};

promise.post = function(url, data, rejectCode, options){
  options = options || {};
  options.type = 'POST';
  options.url = url;
  options.data = data;

  return promise.ajax(options, rejectCode);
};

promise.reject = function(){
  var dfd = $.Deferred();
  return dfd.reject.apply(dfd, arguments);
};

promise.resolve = function(){
  var dfd = $.Deferred();
  return dfd.resolve.apply(dfd, arguments);
};

promise.with = function(fn){
  var dfd = $.Deferred();
  fn(dfd);
  return dfd;
};

tools = {string: {}, dialog: {}, submit: {}, snippet: {}};

tools.string.upperFirst = function(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
};

tools.string.escape = Handlebars.Utils.escapeExpression;

tools.prefixedSelector = function(prefix){
  return function(selector){
    return $(prefix+" "+selector);
  };
};

/**
  msg:
    list of objects {type, msg} where type in error, warning, info
*/
tools.dialog.resetMessages = function(dialogSelector){
  return function(msgList){
    msgBoxElement = $(dialogSelector+" table.msg-box");
    msgBoxElement.find(".error, .warning, .info").remove();
    for(var i in msgList){
      if(!msgList.hasOwnProperty(i)){
        continue;
      }
      msgBoxElement.find("td").append(
        '<div class="'+msgList[i].type+'">'
          +tools.string.escape(tools.formatMsg(msgList[i]))
          +"</div>"
      );
    }
  };
};

tools.dialog.setActionAbility = function(buttonSelector){
  return function(enabled){
    $(buttonSelector).button("option", "disabled", ! enabled);
  };
};

tools.dialog.close = function(dialogSelector, closeType){
  closeType = closeType || "close";
  return function(){
    $(dialogSelector+".ui-dialog-content.ui-widget-content").dialog(closeType);
  };
};

tools.dialog.inputsToArray = function(inputSelector){
  var values = [];
  $(inputSelector).each(function(i, element) {
    var value = $(element).val().trim();
    if (value.length > 0) {
      values.push(value);
    }
  });
  return values;
};

tools.dialog.resetInputs = function(selector){
  $(selector).each(function(i, element) {
    $(element).val("");
  });
};

tools.snippet.take = function(name){
  var snippet = $("[data-snippet='"+name+"']").eq(0)
    .clone()
    .removeAttr("data-snippet")
  ;

  $("[data-name]", snippet).each(function(){
    $(this).attr("name", $(this).attr("data-name")).removeAttr("data-name");
  });

  return snippet;
};

tools.submit.onCallFail = function(resetMessages){
  return function(XMLHttpRequest, dialogCodes){
    dialogCodes = dialogCodes || [];
    if(XMLHttpRequest.status === 403){
      resetMessages([
        {
          type: "error",
          msg: $.i18n("haclusterIsRequired"),
        },
      ]);
    }else if(dialogCodes.includes(XMLHttpRequest.status)){
      resetMessages(
        XMLHttpRequest.responseText.split("\n").map(function(line){
          return { type: "error", msg: line };
        })
      );
    }else{
      alert(
        $.i18n("serverReturnedError")+XMLHttpRequest.status
        +"\n"+XMLHttpRequest.responseText
      );
    }
  };
};

tools.submit.confirmForce = function(actionDesc, msgList){
  return confirm(
    "Unable to "+actionDesc+" \n\n"
    + msgList
      .map(function(msg){return tools.formatMsg(msg)})
      .join("\n")
    + "\n\nDo you want to force the operation?"
  );
};

tools.formatMsg = function(msg){
  return tools.string.upperFirst(msg.type)+": "+msg.msg;
};

// Vertical buttonset. Borrowed from https://gist.github.com/edersohe/760885
$.fn.buttonsetv = function() {
  $(':radio, :checkbox', this).wrap('<div style="margin: 1px"/>');
  $(this).buttonset();
  $('label:first', this).removeClass('ui-corner-left').addClass('ui-corner-top');
  $('label:last', this).removeClass('ui-corner-right').addClass('ui-corner-bottom');
  mw = 0; // max witdh
  $('label', this).each(function(index){
     w = $(this).width();
     if (w > mw) mw = w; 
  });
  $('label', this).each(function(index){
    $(this).width(mw);
  });
};
