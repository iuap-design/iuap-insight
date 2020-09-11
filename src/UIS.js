import UISEvent from './UISEvent'
import timing from './timing/timingjs'
import { hook, unHook } from "./request-hook/ajax-hook";
import { proxy, unProxy } from "./request-hook/proxy-hook";
import * as Utils from './utils'


const TYPES = {
    timing: "timing",
    device: "device",
    httpError: "httpError",
    httpInfo: "httpInfo",
    event: "event",
    httpResourceError: "httpResourceError",
    websocketError: "websocketError",
    unhandledRejectionError: "unhandledRejectionError",
    scirptError: "scirptError",
    record: "record",
};

/**
 * UIS 基类对象
 * API：trackEvent、treackError、start等
 */
function UIS(){
    this.config = {
        trackerUrl: '',
        getRequestCharacterLimit: 2000,
        // First-party cookie name prefix
        configCookieNamePrefix: '_pk_',
        siteId: '',
        userId: '',
        visitorId: ''
    };
    this.isClickTrackingEnabled = false;
    this.isTrackingJqueryAjax = false;
    this.isTrackedClick = false; // 是否已经监听过点击事件
};


UIS.isDebug = false;

UIS.debug = function() {
    if (this.isDebug) {
        if (window.console) {
            if (console.log.apply) {
                if (window.console.firebug) {
                    console.log.apply(this, arguments);
                } else {
                    console.log.apply(console, arguments);
                }
            }
        }
    }
};



// 对象方法
UIS.fn = UIS.prototype;

UIS.fn.setOption = function(name, value) {
    this.config[name] = value;
};

UIS.fn.getOption = function(name) {
    return this.config[name];
};

UIS.fn.getCookieName = function(name) {
    return this.config['configCookieNamePrefix'] + name + '.' + this.config['siteId'];
};

UIS.fn.prepareRequestData = function(properties) {

        var data = {};

        for (var param in properties) {
            var value = '';
            if (properties.hasOwnProperty(param)) {
                if (Utils.is_array(properties[param])) {
                    var n = properties[param].length;
                    for (var i = 0; i < n; i++) {
                        if (Utils.is_object(properties[param][i])) {
                            for (var o_param in properties[param][i]) {
                                data[Utils.sprintf('%s[%s][%s]', param, i, o_param)] = Utils.urlEncode(properties[param][i][o_param]);
                            }
                        } else {
                            // what the heck is it then. assume string
                            data[Utils.sprintf('%s[%s]', param, i)] = Utils.urlEncode(properties[param][i]);
                        }
                    }
                    // assume it's a string
                } else {
                    data[Utils.sprintf('%s', param)] = Utils.urlEncode(properties[param]);
                }
            }
        }
        return data;
    };

UIS.fn.prepareRequestDataForGet = function(properties) {
    var properties = this.prepareRequestData(properties);
    var get = '';
    for (var param in properties) {
        if (properties.hasOwnProperty(param)) {
            var kvp = '';
            kvp = Utils.sprintf('%s=%s&', param, properties[param]);
            get += kvp;
        }
    }
    return get;
};

UIS.fn._parseRequestUrl = function(properties) {

    var params = this.prepareRequestDataForGet(properties);

    var log_url = this.getOption('trackerUrl'); //this.getLoggerEndpoint();

    if (log_url.indexOf('?') === -1) {
        log_url += '?';
    } else {
        log_url += '&';
    }
    var full_url = log_url + params;
    return full_url;
};

UIS.fn.getIframeDocument = function(iframe) {
    var doc = null;
    if (iframe.contentDocument) {
        // Firefox, Opera
        doc = iframe.contentDocument;
    } else if (iframe.contentWindow && iframe.contentWindow.document) {
        // Internet Explorer
        doc = iframe.contentWindow.document;
    } else if (iframe.document) {
        // Others?
        doc = iframe.document;
    }

    // If we did not succeed in finding the document then throw an exception
    if (doc == null) {
        UIS.debug("Document not found, append the parent element to the DOM before creating the IFrame");
    }

    doc.open();
    doc.close();

    return doc;
};

UIS.fn.postFromIframe = function(ifr, data) {

    var post_url = this.getOption('trackerUrl'); //this.getLoggerEndpoint();
    var doc = this.getIframeDocument(ifr);
    // create form
    //var frm = this.createPostForm();
    var form_name = 'post_form' + Math.random();

    // cannot set the name of an element using setAttribute
    if (Utils.isIE() && Utils.getInternetExplorerVersion() < 9.0) {
        var frm = doc.createElement('<form name="' + form_name + '"></form>');
    } else {
        var frm = doc.createElement('form');
        frm.setAttribute('name', form_name);
    }

    frm.setAttribute('id', form_name);
    frm.setAttribute("action", post_url);
    frm.setAttribute("method", "POST");

    // create hidden inputs, add them to form
    for (var param in data) {
        if (data.hasOwnProperty(param)) {
            // cannot set the name of an element using setAttribute
            if (Utils.isIE() && Utils.getInternetExplorerVersion() < 9.0) {
                var input = doc.createElement("<input type='hidden' name='" + param + "' />");
            } else {
                var input = document.createElement("input");
                input.setAttribute("name", param);
                input.setAttribute("type", "hidden");
            }
            input.setAttribute("value", data[param]);
            frm.appendChild(input);
        }
    }
    // add form to iframe
    doc.body.appendChild(frm);

    //submit the form inside the iframe
    doc.forms[form_name].submit();

    // remove the form from iframe to clean things up
    doc.body.removeChild(frm);
};

/**
 * Generates a hidden 1x1 pixel iframe
 */
UIS.fn.generateHiddenIframe = function(parentElement, data) {

    var iframe_name = 'uis-tracker-post-iframe';

    if (Utils.isIE() && Utils.getInternetExplorerVersion() < 9.0) {
        var iframe = document.createElement('<iframe name="' + iframe_name + '" src="about:blank" width="1" height="1"></iframe>');
    } else {
        var iframe = document.createElement("iframe");
        iframe.setAttribute('name', iframe_name);
        iframe.setAttribute('src', 'about:blank');
        iframe.setAttribute('width', 1);
        iframe.setAttribute('height', 1);
    }

    iframe.setAttribute('class', iframe_name);
    iframe.setAttribute('style', 'border: none;');
    //iframe.onload = function () { this.postFromIframe( data );};

    var that = this;

    // If no parent element is specified then use body as the parent element
    if (parentElement == null) {
        parentElement = document.body;
    }
    // This is necessary in order to initialize the document inside the iframe
    parentElement.appendChild(iframe);

    // set a timer to check and see if the iframe is fully loaded.
    // without this there is a race condition in IE8
    var timer = setInterval(function() {

        var doc = that.getIframeDocument(iframe);

        if (doc) {
            that.postFromIframe(iframe, data);
            clearInterval(timer);
        }

    }, 1);

    // needed to cleanup history items in browsers like Firefox

    var cleanuptimer = setInterval(function() {
        parentElement.removeChild(iframe);
        clearInterval(cleanuptimer);
    }, 1000);

};


UIS.fn.cdPost = function(data) {

    var container_id = "uis-tracker-post-container";
    var post_url = this.getOption('trackerUrl'); //this.getLoggerEndpoint();

    var iframe_container = document.getElementById(container_id);

    // create iframe container if necessary
    if (!iframe_container) {

        // create post frame container
        var div = document.createElement('div');
        div.setAttribute('id', container_id);
        document.body.appendChild(div);
        iframe_container = document.getElementById(container_id);
    }

    // create iframe and post data once its fully loaded.
    this.generateHiddenIframe(iframe_container, data);
};

UIS.fn._getTarget = function(e) {

    // Determine the actual html element that generated the event
    var targ = e.target || e.srcElement;

    if (typeof targ == 'undefined' || targ == null) {
        return null; //not all ie events provide srcElement
    }
    if (targ.nodeType == 3) {
        targ = target.parentNode;
    }
    return targ;
};

UIS.fn.findPosX = function(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    } else if (obj.x)
        curleft += obj.x;
    return curleft;
};

UIS.fn.findPosY = function(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop
            obj = obj.offsetParent;
        }
    } else if (obj.y)
        curtop += obj.y;
    return curtop;
};

UIS.fn.getReferrer = function() {
    var referrer = '';
    try {
        referrer = window.top.document.referrer;
    } catch (e) {
        if (window.parent) {
            try {
                referrer = window.parent.document.referrer;
            } catch (e2) {
                referrer = '';
            }
        }
    }

    if (referrer === '') {
        referrer = document.referrer;
    }
    return referrer;
};


UIS.fn.getParameter = function(url, name) {
    var regexSearch = "[\\?&#]" + name + "=([^&#]*)";
    var regex = new RegExp(regexSearch);
    var results = regex.exec(url);
    return results ? decodeURIComponent(results[1]) : '';
};

UIS.fn.getHostName = function(url) {
    var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
        matches = e.exec(url);
    return matches ? matches[1] : url;
}

/**
 * [track description]
 * @param  {[type]} e    [description] 事件对象
 * @param  {[type]} name [description] 字段名称
 * @param  {[type]} val  [description] 字段值
 * @return {[type]}      [description]
 */
UIS.fn.track = function(e, name, val){
  uis.setOption(name, val);
  // 定制 click_text 字段
  this.clickEventHandler(e, true);

}

UIS.fn.urlFixup = function(hostName, href, referrer) {
    if (!hostName) {
        hostName = '';
    }
    if (!href) {
        href = '';
    }
    if (hostName === 'translate.googleusercontent.com') { // Google
        if (referrer === '') {
            referrer = href;
        }
        href = this.getParameter(href, 'u');
        hostName = this.getHostName(href);
    } else if (hostName === 'cc.bingj.com' || // Bing
        hostName === 'webcache.googleusercontent.com' || // Google
        hostName.slice(0, 5) === '74.6.') { // Yahoo (via Inktomi 74.6.0.0/16)
        href = document.links[0].href;
        hostName = this.getHostName(href);
    }
    return [hostName, href, referrer];
};


/**
 * ======================================================================
 * public
 * ======================================================================
 */

/**
 * 发送请求，记录日志
 *
 * @param properties
 * @param block
 * @param callback
 */
UIS.fn.logEvent = function(properties, block, callback) {

    //每次发送请求之前，检查是否有jqueryAjax的track
    if (this.isTrackingJqueryAjax === false){
      /* if (window.$ && window.$.ajax){
        this.trackJqueryAjax(window.$);
      } */
    }

    var url = this._parseRequestUrl(properties);
    var limit = this.getOption('getRequestCharacterLimit');
    if (url.length > limit) {
        //this.cdPost( this.prepareRequestData( properties ) );
        var data = this.prepareRequestData(properties);
        this.cdPost(data);
    } else {
        UIS.debug('url : %s', url);
        var image = new Image(1, 1);
        //expireDateTime = now.getTime() + delay;
        image.onLoad = function() {};
        image.src = url;
        if (block) {
            //OWA.debug(' blocking...');
        }
        UIS.debug('Inserted web bug for %s', properties['event_type']);
    }
    if (callback && (typeof(callback) === "function")) {
        callback();
    }
};

/**
 * 发送请求，记录日志
 *
 * @param properties
 * @param block
 * @param callback
 */
UIS.fn.report = function (data, block, callback) {

    let generalInfo = this.getGeneralInfo();
    let reportData = {
        ...generalInfo,
        device: this.getDevice(),
        ...data
    }
    
    // Utils.post(this.getOption("trackerUrl"), reportData)
    if (navigator.sendBeacon) {
        navigator.sendBeacon(this.getOption("trackerUrl"), JSON.stringify(reportData))
    }
    return

    //每次发送请求之前，检查是否有jqueryAjax的track
    if (this.isTrackingJqueryAjax === false){
      /* if (window.$ && window.$.ajax){
        this.trackJqueryAjax(window.$);
      } */
    }

    var url = this._parseRequestUrl(reportData);
    var limit = this.getOption('getRequestCharacterLimit');
    if (url.length > limit) {
        //this.cdPost( this.prepareRequestData( properties ) );
        var data = this.prepareRequestData(reportData);
        this.cdPost(data);
    } else {
        UIS.debug('url : %s', url);
        var image = new Image(1, 1);
        //expireDateTime = now.getTime() + delay;
        image.onLoad = function() {};
        image.src = url;
        UIS.debug('Inserted web bug for %s');
    }
    if (callback && (typeof(callback) === "function")) {
        callback();
    }
};

/**
 * 获取上报通用信息
 */
UIS.fn.getGeneralInfo = function () {
    let general = {
        host: window.location.host,
        // 全链路追踪的唯一id
        traceId: "",
        // 全链路追踪的name
        traceName: "",
        // 录制的唯一id ,从cookie里取值
        uid: Utils.getCookie("mdd_monitor_uid"),
        spanId: "",
        pSpanId: "",
        // 打印信息
        msg: "",
        // 当前时间
        clientTs: Date.now(),
        // Cookie yonyou_uid
        userId: Utils.getCookie("yonyou_uid"),
        // Cookie tenantid
        tenantId: Utils.getCookie("tenantid"),
        // span名称 查询 新增
        name: "",
        // 函数名
        remoteMethod: "",

        // 应用appid
        siteId: "",
        pageTitle: window.document.title,
        // 节点URL
        url: window.location.href,
        // 节点父级URL
        urlRef: this.getUrlRef(),
        // 节点编码
        serviceCode: "",
        // 节点名称
        serviceName: "",
    };

    return general;
};

/**
 * 获取节点父级URL
 */
UIS.fn.getUrlRef = function () {
    var locationArray = this.urlFixup(document.domain, window.location.href, this.getReferrer());
    var configReferrerUrl = decodeURIComponent(locationArray[2]);
    return configReferrerUrl || ""
}

/**
 * 获取设备信息
 */
UIS.fn.getDevice = function () {
    var device = new UISEvent(this);
    var action_id = device.generateRandomUuid();

    device.setEventType("device");
    device.setAction(action_id);

    let info = Utils.getInfo()
    if (info) {
        // 浏览器名称
        device.set('browserName', info.name);

        // 浏览器版本
        device.set('browser', info.fullVersion);

        // 操作系统名称
        device.set('osName', info.os);

        // 操作系统版本
        // device.set('os', "");
    }

    // 页面URL
    device.set('url', window.location.href);

    // 用户ip
    // device.set('ip', "");

    // 设备类型
    device.set('logType', "client");

    // 分辨率
    device.set('res', `${window.screen.width}x${window.screen.height}`);

    // 当前屏幕宽度
    device.set('resX', window.screen.width);

    // 当前屏幕高度
    device.set('resY', window.screen.height);

    return device.getProperties()
};

/**
 * [clickEventHandler description] 被 track 和 trackClicks 两个 API 调用
 * @param  {[type]}  e                  [description]
 * @param  {Boolean} isComstomClickText [description]
 * @return {[type]}                     [description]
 */
UIS.fn.clickEventHandler = function(e, isComstomClickText) {

    // hack for IE
    e = e || window.event;

    // 只有调用 track 才走这种逻辑，需要防止多次提交
      if ( this.isTrackedClick ) {
        this.isTrackedClick = false;
        return
      } else {
        this.isTrackedClick = true
        if (!isComstomClickText) this.isTrackedClick = false;
      }



    var click = new UISEvent(this);
    // set event type
    click.setEventType("click");
    // click.setAction('click');
    var targ = this._getTarget(e)
    var dom_value = '(not set)';
    var click_id = click.generateRandomUuid();
    click.setAction(click_id);

    if (targ.hasOwnProperty && targ.hasOwnProperty('value') && targ.value.length > 0) {
        dom_value = targ.value;
    }
    // 设置点击时候的信息
    if ( isComstomClickText ) {
      var click_text_value = uis.getOption('clickText')
      click.set('clickText', click_text_value);
    } else {
      click.set('clickText', targ.innerText);
    }

    if (targ.attributes && targ.attributes.hasOwnProperty('name') && targ.attributes.name.value && targ.attributes.name.value.length > 0) {
        click.set('clickName', targ.attributes.name.value);
    }

    if (targ.value && targ.value.length > 0) {
        click.set('clickValue', targ.value);
    }

    if (targ.id && targ.id.length > 0) {
        click.set('clickId', targ.id);
    }

    if (targ.className && targ.className.length > 0) {
        click.set('clickClass', targ.className);
    }

    click.set("clickTag", Utils.strtolower(targ.tagName));

    click.set('clickPosX', this.findPosX(targ));
    click.set('clickPosY', this.findPosY(targ));

 
    let reportData = {
        [TYPES.event]: click.getProperties()
    }
    this.report(reportData)

};

/**
 * [bindClickEvents description]
 * @param  {Boolean} isComstomClickText [description]
 *    true 定制 click_text 字段
 *    false 不定制 click_text 字段
 * @return {[type]}                     [description]
 */
UIS.fn.bindClickEvents = function(isComstomClickText) {
  if (!this.isClickTrackingEnabled) {
      var that = this;
      // Registers the handler for the before navigate event so that the dom stream can be logged
      if (window.addEventListener) {
          window.addEventListener('click', function(e) {
              that.clickEventHandler(e, isComstomClickText);
          }, false);
      } else if (window.attachEvent) {
          document.attachEvent('onclick', function(e) {
              that.clickEventHandler(e, isComstomClickText);
          });
      }
      this.isClickTrackingEnabled = true;
  }
};

/**
 *监控click事件
 * @param handler
 */
UIS.fn.trackClicks = function( ) {
    // this.setOption('logClicksAsTheyHappen', true);
    // 不定制 click_text 字段
    this.bindClickEvents( false );
};

/**
 * 监控 XMLHttpRequest HTTP 请求
 */
UIS.fn.trackHttpInfo = function () {
    let requestData = {}
    let _self = this;

    proxy({
        //请求发起前进入
        onRequest: (config, handler) => {
            config.startTime = Date.now()
            requestData = config;
            handler.next(config);
        },
        //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
        onError: (err, handler) => {
            _self._handleReport(requestData, undefined, err)
            handler.next(err)

        },
        //请求成功后进入
        onResponse: (response, handler) => {
            _self._handleReport(requestData, response)
            handler.next(response)
        }
    })
}

UIS.fn._handleReport = function (request = {}, response, err) {
    var event = new UISEvent(this);
    let url = request.url

    event.set('httpReqUrl', Utils.handleUrlWithOrigin(url));
    if (url && url.split("?").length > 1) {
        event.set('httpReqQueryString', url.split("?")[1]);
    }
    event.set('domainKey',request.headers && request.headers["domain-key"] ? request.headers["domain-key"] : "");
    event.set('host', Utils.getUrlHost(url));
    event.set('httpReqMethod', request.method);
    event.set('httpReqBody', request.body);
    if (response) {
        event.set('httpResStatus', response.status);
        event.set('httpResStatusText', response.statusText);
        event.set('httpResBody', response.response);
    }

    if (err) {
        event.set('httpErr', err.error.type);
    }

    event.set('httpCost', Date.now() - request.startTime);

    let reportData = {
        [TYPES.httpInfo]: event.getProperties()
    }
    this.report(reportData)
}

/**
 * 监控jqueryAjax请求
 * @param jq
 */
UIS.fn.trackJqueryAjax = function(jq) {
    var self = this;
    var ajaxBack = jq.ajax;
    jq.ajax = function(url1, setting) {
        if (typeof url1 === "object") {
            setting = url1;
            url1 = undefined;
        }

        // Force options to be an object
        setting = setting || {};

        var cb = setting.complete,
            bs = setting.beforeSend,
            df = setting.dataFilter,
            begin = new Date().getTime(),
            oneTime,
            url = setting['url'];
        setting.beforeSend = function(xhr) {
            xhr.setRequestHeader("Action-Id", window.action_id);
            if (jq.isFunction(bs)) {
                bs.apply(this, arguments)
            }
        }
        setting.dataFilter = function(data, type) {
            oneTime = new Date().getTime();
            if (jq.isFunction(df)) {
                return df.apply(this, arguments)
            }
            return data;
        }
        setting.complete = function(data, textStatus) {
            //var oneTime = new Date().getTime();
            var ajax_id = data.getResponseHeader("txID");
            var actionId = data.getResponseHeader("Action-Id");
            var clength = data.getResponseHeader("Content-Length");
            if (jq.isFunction(cb)) {
                cb.apply(this, arguments)
            }
            var twoTime = new Date().getTime();
            var ajax_timing = oneTime - begin;
            var ajax_timing_cb = twoTime - begin;
            var event = new UISEvent(self);

            // event.setEventType("ajax");
            // event.setAction(actionId);
            // event.set('ajax_id', ajax_id);
            // event.set('content_length', clength || 0);
            // event.set('ajax_tm', ajax_timing || 0);
            // event.set('ajax_tm_cb', ajax_timing_cb || 0);

            event.set('http_req_url', url1);
            if (url1.split("?").length > 1) {
                event.set('http_req_queryString',url1.split("?")[1]);
            }
            event.set('http_req_method', setting.type || "GET");
            event.set('http_req_body', setting.data);
            event.set('http_res_status', data.status);
            event.set('http_res_statusText', textStatus);
            event.set('http_res_body', data.responseText);

            let reportData = {
                [TYPES.httpInfo]: event.getProperties()
            }
            self.report(reportData)
        };
        return ajaxBack(url1, setting);
    }
    this.isTrackingJqueryAjax = true;
};

UIS.fn._trackRouterEvent = function(event) {
    var locationArray = this.urlFixup(document.domain, window.location.href, this.getReferrer());
    //var locationHrefAlias = decodeURIComponent(locationArray[1]);
    var configReferrerUrl = decodeURIComponent(locationArray[2]);
    event.setAction(window.action_id);
    event.set('url', window.location.href);
    if (configReferrerUrl)
        event.set("url_ref", configReferrerUrl);
};

UIS.fn.trackRouter = function() {
    var that = this;
    var hashChangeFunc = function(e) {
        var event = new UISEvent(that);
        event.setEventType("page_route");
        // event.setAction("");
        that._trackRouterEvent(event);
        that.logEvent(event.getProperties());
    };
    var popstateFunc = function(e) {
        var event = new UISEvent(that);
        event.setEventType("page_route");
        // event.setAction("");
        that._trackRouterEvent(event);
        that.logEvent(event.getProperties());
    };

    if (typeof window.onhashchange != 'undefined') {
        if (window.addEventListener) {
            window.addEventListener('hashchange', hashChangeFunc, false);
        } else if (window.attachEvent) {
            window.attachEvent('onhashchange', hashChangeFunc);
        }
    };
    if (typeof window.onpopstate != 'undefined') {
        if (window.addEventListener) {
            window.addEventListener('popstate', popstateFunc, false);
        } else if (window.attachEvent) {
            window.attachEvent('onpopstate', popstateFunc);
        }
    };
    if (window.history.pushState) {
        window.history._pushState = window.history.pushState;
        window.history.pushState = function(state, title, url) {
            window.history._pushState(state, title, url);
            var event = new UISEvent(that);
            event.setEventType("page_route");
            // event.setAction("");
            that._trackRouterEvent(event);
            that.logEvent(event.getProperties());
        }
    }
    if (window.history.replaceState) {
        window.history._replaceState = window.history.replaceState;
        window.history.replaceState = function(state, title, url) {
            window.history._replaceState(state, title, url);
            var event = new UISEvent(that);
            event.setEventType("page_route");
            // event.setAction("");
            that._trackRouterEvent(event);
            that.logEvent(event.getProperties());
        }
    }
};

UIS.fn.trackPageLoad = function() {
    var that = this;
    var event = new UISEvent(this);
    var myTime = timing.getTimes();
    if (myTime.loadTime > 0) {
        //var load_tm = myTime.loadTime;
        var action_id = event.generateRandomUuid();
        event.setEventType("page_load");
        event.setAction(action_id);
        event.set('tUnload', myTime.t_unload || 0);
        event.set('tRedirect', myTime.t_redirect || 0);
        event.set('tDns', myTime.t_dns || 0);
        event.set('tTcp', myTime.t_tcp || 0);
        event.set('tRequest', myTime.t_request || 0);
        event.set('tResponse', myTime.t_response || 0);
        event.set('tPaint', myTime.t_paint || 0);
        event.set('tDom', myTime.t_dom || 0);
        event.set('tDomready', myTime.t_domready || 0);
        event.set('tLoad', myTime.t_load || 0);
        event.set('tOnload', myTime.t_onload || 0);
        event.set('tWhite', myTime.t_white || 0);
        event.set('tAll', myTime.t_all || 0);
        event.set('ajaxTm', myTime.t_all || 0);
        let reportData = {
            [TYPES.timing]: event.getProperties()
        }
        this.report(reportData)
        // this.logEvent(event.getProperties());

    } else {
        setTimeout(function() {
            that.trackPageLoad()
        }, 400);
    }
};

UIS.fn.log = function(params) {
    if (typeof params != 'object') return;
    var event = new UISEvent(this);
    event.setEventType('custom');
    for (var key in params) {
        if (key.indexOf('ext') == 0) {
            event.set(key, params[key])
        }
    }
    this.logEvent(event.getProperties());
};

UIS.fn.trackError = function() {
    window.onerror = function(msg, url, line, col, error) {
        if (msg != "Script error." && !url) {
            return true;
        }
        setTimeout(function() {
                var data = {};
                col = col || (window.event && window.event.errorCharacter) || 0;
                data.url = url;
                data.line = line;
                data.col = col;
                data.msg = "";
                if (!!error && !!error.stack) {
                    data.msg = error.stack.toString();
                } /* else if (!!arguments.callee) {
                    var ext = [];
                    var f = arguments.callee.caller,
                        c = 3;
                    while (f && (--c > 0)) {
                        ext.push(f.toString());
                        if (f === f.caller) {
                            break;
                        }
                        f = f.caller;
                    }
                    ext = ext.join(",");
                    data.msg = ext;
                } */
                var uis = window.uis || new UIS();
                var event = new UISEvent(uis);
                event.setEventType(TYPES.scirptError);
                event.set("fileName", data.url);
                event.set("lineNumber", data.line);
                event.set("columnNumber", data.col);
                event.set("exception", msg);
                event.set("stacktrace", data.msg.toString());
                // data.msg 字段会将 js 出错的完整信息都提交
                // event.set("error_msg", "JS 逻辑异常");
                // uis.logEvent(event.getProperties());

                let reportData = {
                    [TYPES.scirptError]: event.getProperties()
                }
                uis.report(reportData)

            }, 0)
            //return true;
    };
}

/**
 * SDK 初始化
 * @param {*} params 
 */
UIS.fn.start = function(params) {
    if (params['trackerUrl']){
      this.setOption("trackerUrl", params['trackerUrl']);
    }
    if (params['userId']){
      this.setOption("userId", params['userId']);
    }
    if (params['siteId']){
      this.setOption("siteId", params['siteId']);
    }
    // 会统计所有的点击事件，并触发信息提交
    this.trackClicks();
    // this.trackRouter();
    this.trackPageLoad();
    this.trackError();
    this.trackHttpInfo()

    // 1.只有项目中使用了 jquery 提供的 ajax 方法的时候，才使用 trackJqueryAjax 进行 http 信息统计
    // 2.通用方案待确定
    // if (window.$ && window.$.ajax){
    //   this.trackJqueryAjax(window.$);
    // }
}

export default UIS