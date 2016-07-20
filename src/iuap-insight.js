/**
 * Created by dingrf on 2016/7/14.
 */


/**
 * ===========================================================
 * timing.js
 * 参考：
 * https://github.com/tjuking/performance-timing/blob/master/performance-timing.js
 * https://github.com/addyosmani/timing.js/blob/master/timing.js
 * ===========================================================
 */
(function(window) {
    'use strict';
    /**
     * Navigation Timing API helpers
     * timing.getTimes();
     **/
    window.timing = {
            /**
             * Outputs extended measurements using Navigation Timing API
             * @param  Object opts Options (simple (bool) - opts out of full data view)
             * @return Object      measurements
             */
            getTimes: function(opts) {
                var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

                if (performance === undefined) {
                    return false;
                }

                var timing = performance.timing;
                var api = {};
                opts = opts || {};

                if (timing) {
                    if(opts && !opts.simple) {
                        for (var k in timing) {
                            if (timing.hasOwnProperty(k)) {
                                api[k] = timing[k];
                            }
                        }
                    }


                    // Time to first paint
                    if (api.firstPaint === undefined) {
                        // All times are relative times to the start time within the
                        // same objects
                        var firstPaint = 0;

                        // Chrome
                        if (window.chrome && window.chrome.loadTimes) {
                            // Convert to ms
                            firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
                            api.firstPaintTime = firstPaint; //firstPaint - (window.chrome.loadTimes().startLoadTime*1000);
                        }
                        // IE
                        else if (typeof window.performance.timing.msFirstPaint === 'number') {
                            firstPaint = window.performance.timing.msFirstPaint;
                            api.firstPaintTime = firstPaint //firstPaint - window.performance.timing.navigationStart;
                        }
                        // Firefox
                        // This will use the first times after MozAfterPaint fires
                        //else if (window.performance.timing.navigationStart && typeof InstallTrigger !== 'undefined') {
                        //    api.firstPaint = window.performance.timing.navigationStart;
                        //    api.firstPaintTime = mozFirstPaintTime - window.performance.timing.navigationStart;
                        //}
                        if (opts && !opts.simple) {
                            api.firstPaint = firstPaint;
                        }
                    }

                    // Total time from start to load
                    api.loadTime = timing.loadEventEnd - timing.fetchStart;
                    // Time spent constructing the DOM tree
                    api.domReadyTime = timing.domComplete - timing.domInteractive;
                    // Time consumed preparing the new page
                    api.readyStart = timing.fetchStart - timing.navigationStart;
                    // Time spent during redirection
                    api.redirectTime = timing.redirectEnd - timing.redirectStart;
                    // AppCache
                    api.appcacheTime = timing.domainLookupStart - timing.fetchStart;
                    // Time spent unloading documents
                    api.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
                    // DNS query time
                    api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
                    // TCP connection time
                    api.connectTime = timing.connectEnd - timing.connectStart;
                    // Time spent during the request
                    api.requestTime = timing.responseEnd - timing.requestStart;
                    // Request to completion of the DOM loading
                    api.initDomTreeTime = timing.domInteractive - timing.responseEnd;
                    // Load event time
                    api.loadEventTime = timing.loadEventEnd - timing.loadEventStart;

                    var startTime = timing.navigationStart || timing.fetchStart;
                    api.t_unload =timing.unloadEventEnd - timing.unloadEventStart; //上个文档的卸载时间
                    api.t_redirect = timing.redirectEnd - timing.redirectStart; //*重定向时间
                    api.t_dns  = timing.domainLookupEnd - timing.domainLookupStart; //*DNS查询时间
                    api.t_tcp =  timing.connectEnd - timing.connectStart; //*服务器连接时间
                    api.t_request = timing.responseStart - timing.requestStart; //*服务器响应时间
                    api.t_response =  timing.responseEnd - timing.responseStart; //*网页下载时间
                    api.t_paint = parseInt(api.firstPaintTime) - parseInt(startTime); //*首次渲染时间
                    api.t_dom =  timing.domContentLoadedEventStart - timing.domLoading; //dom ready时间（阶段）
                    api.t_domready = timing.domContentLoadedEventStart - startTime; //*dom ready时间（总和）
                    api.t_load = timing.loadEventStart - timing.domLoading; //onload时间（阶段）
                    api.t_onload = timing.loadEventStart - startTime; //*onload时间（总和）
                    api.t_white = timing.responseStart - startTime; //*白屏时间
                    api.t_all = timing.loadEventEnd - startTime; //整个过程的时间之和



                }

                return api;
            },
            /**
             * Uses console.table() to print a complete table of timing information
             * @param  Object opts Options (simple (bool) - opts out of full data view)
             */
            printTable: function(opts) {
                var table = {};
                var data  = this.getTimes(opts) || {};
                Object.keys(data).sort().forEach(function(k) {
                    table[k] = {
                        ms: data[k],
                        s: +((data[k] / 1000).toFixed(2))
                    };
                });
                console.table(table);
            },
            /**
             * Uses console.table() to print a summary table of timing information
             */
            printSimpleTable: function() {
                this.printTable({simple: true});
            }
        };

})(this);






/**
 *============================================================
 * 全局方法
 * ===========================================================
 */

function utf8_encode(argString) {
    return decodeURI(encodeURIComponent(argString));
}

function hash(str) {
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   jslinted by: Anthon Pang (http://piwik.org)

    var
        rotate_left = function (n, s) {
            return (n << s) | (n >>> (32 - s));
        },

        cvt_hex = function (val) {
            var strout = '',
                i,
                v;

            for (i = 7; i >= 0; i--) {
                v = (val >>> (i * 4)) & 0x0f;
                strout += v.toString(16);
            }

            return strout;
        },

        blockstart,
        i,
        j,
        W = [],
        H0 = 0x67452301,
        H1 = 0xEFCDAB89,
        H2 = 0x98BADCFE,
        H3 = 0x10325476,
        H4 = 0xC3D2E1F0,
        A,
        B,
        C,
        D,
        E,
        temp,
        str_len,
        word_array = [];

    str = utf8_encode(str);
    str_len = str.length;

    for (i = 0; i < str_len - 3; i += 4) {
        j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 |
            str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (str_len & 3) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
            break;
    }

    word_array.push(i);

    while ((word_array.length & 15) !== 14) {
        word_array.push(0);
    }

    word_array.push(str_len >>> 29);
    word_array.push((str_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) {
            W[i] = word_array[blockstart + i];
        }

        for (i = 16; i <= 79; i++) {
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

    return temp.toLowerCase();
}

/**
 *事件类
 */

UISEvent = function(uis) {
    this.uis = uis;
    var now = new Date(),
        userId = uis.getOption('userId'),
        cookieVisitorIdValues = this.getValuesFromVisitorIdCookie(),
        attributionCookie = this.loadReferrerAttributionCookie(),
        campaignNameDetected = attributionCookie[0],
        campaignKeywordDetected = attributionCookie[1],
        referralTs = attributionCookie[2],
        referralUrl = attributionCookie[3],
        charSet = document.characterSet || document.charset;

    if (!charSet || charSet.toLowerCase() === 'utf-8') {
        charSet = null;
    }


    this.properties = {};
    this.id = '';
    // this.siteId = '';
    //this.set('timestamp', Math.round(new Date().getTime() / 1000));
    this.set('site_id',uis.getOption('siteId'));
    // this.set('rec',1);
    // this.set('r',String(Math.random()).slice(2, 8));
    this.set('client_ts',now.getTime());
    // this.set('url',now.getSeconds());
    // this.set('urlref',now.getSeconds());
    // this.set('s',now.getSeconds());
    if (userId)
        this.set('user_id', userId);
    this.set('visitor_id', cookieVisitorIdValues.uuid);
    // this.set('_idts', cookieVisitorIdValues.createTs);
    // this.set('_idvc', cookieVisitorIdValues.visitCount);
    // this.set('_idn', cookieVisitorIdValues.newVisitor);
    this.set('res', window.screen.width + ' * ' +  window.screen.height);
    this.set('res_x', window.screen.width);
    this.set('res_y', window.screen.height);
    this.set('page_title', document.title);
    var  locationArray = uis.urlFixup(document.domain, window.location.href, uis.getReferrer());
    var configReferrerUrl = decodeURIComponent(locationArray[2]);
    this.set('url',window.location.href);
    if (configReferrerUrl)
        this.set("url_ref", configReferrerUrl);
    this.set("host", window.location.host);


}

UISEvent.prototype = {
    get : function(name) {
        if ( this.properties.hasOwnProperty(name) ) {
            return this.properties[name];
        }
    },

    set : function(name, value) {
        this.properties[name] = value;
    },

    setEventType : function(event_type) {
        this.set("type", event_type);
    },

    setAction : function(action){
        this.set("action_id", action);
        window.action_id = action;
    },

    // setName : function(name){
    //     this.set("e_n", name);
    // },
    //
    // setValue : function(value){
    //     this.set("e_v", value)
    // },

    getProperties : function() {
        return this.properties;
    },

    merge : function(properties) {
        for(param in properties) {
            if (properties.hasOwnProperty(param)) {
                this.set(param, properties[param]);
            }
        }
    },

    isSet : function( name ) {
        if ( this.properties.hasOwnProperty( name ) ) {
            return true;
        }
    },
    generateRandomUuid: function() {
        return hash(
            (navigator.userAgent || '') +
            (navigator.platform || '') +
            (new Date()).getTime() +
            Math.random()
        ).slice(0, 16);
    },
    loadVisitorIdCookie : function() {
        var now = new Date(),
            nowTs = Math.round(now.getTime() / 1000),
            idCookieName = this.uis.getCookieName('id'),
            visitorIdCookieName = this.uis.getCookieName('visitorId'),
            id = UIS.getCookie(idCookieName),
            cookieValue,
            visitorId = UIS.getCookie(visitorIdCookieName);
        // Visitor ID cookie found
        if (id) {
            cookieValue = id.split('.');

            // returning visitor flag
            cookieValue.unshift('0');
            return cookieValue;
        }

        if (!visitorId){
            visitorId = this.generateRandomUuid();
            UIS.setCookie(visitorIdCookieName, visitorId)
        }
        // No visitor ID cookie, let's create a new one
        cookieValue = [
            // new visitor
            '1',
            // uuid
            visitorId,
            // creation timestamp - seconds since Unix epoch
            nowTs,
            // visitCount - 0 = no previous visit
            0,
            // current visit timestamp
            nowTs,
            // last visit timestamp - blank = no previous visit
            '',
            // last ecommerce order timestamp
            ''
        ];
        return cookieValue;
    },
    getValuesFromVisitorIdCookie: function() {
        var cookieVisitorIdValue = this.loadVisitorIdCookie(),
            newVisitor = cookieVisitorIdValue[0],
            uuid = cookieVisitorIdValue[1],
            createTs = cookieVisitorIdValue[2],
            visitCount = cookieVisitorIdValue[3],
            currentVisitTs = cookieVisitorIdValue[4],
            lastVisitTs = cookieVisitorIdValue[5];

        // case migrating from pre-1.5 cookies
        if (!UIS.isDefined(cookieVisitorIdValue[6])) {
            cookieVisitorIdValue[6] = "";
        }

        var lastEcommerceOrderTs = cookieVisitorIdValue[6];

        return {
            newVisitor: newVisitor,
            uuid: uuid,
            createTs: createTs,
            visitCount: visitCount,
            currentVisitTs: currentVisitTs,
            lastVisitTs: lastVisitTs,
            lastEcommerceOrderTs: lastEcommerceOrderTs
        };
    },
    getVisitorId: function () {
        return this.getValuesFromVisitorIdCookie().uuid;
    },
    loadReferrerAttributionCookie : function() {
        var cookie = UIS.getCookie(this.uis.getCookieName('ref'));

        if (cookie.length) {
            try {
                cookie = JSON.parse(cookie);
                if (UIS.is_object(cookie)) {
                    return cookie;
                }
            } catch (ignore) {
                // Pre 1.3, this cookie was not JSON encoded
            }
        }

        return [
            '',
            '',
            0,
            ''
        ];
    }

};


var UIS = function(){
    this.config = {
        trackerUrl: '',
        getRequestCharacterLimit:2000,
        // First-party cookie name prefix
        configCookieNamePrefix : '_pk_',
        siteId : '',
        userId : '',
        visitorId:''
    };
    this.isClickTrackingEnabled = false;
};

//全局方法

/**
 * 判断是否是数组
 * @param input
 * @returns {boolean}
 */
UIS.is_array = function(input){
    return typeof(input)=='object'&&(input instanceof Array);
};

/**
 * 是否是对象
 * @param mixed_var
 * @returns {boolean}
 */
UIS.is_object = function (mixed_var) {
    if (mixed_var instanceof Array) {
        return false;
    } else {
        return (mixed_var !== null) && (typeof( mixed_var ) == 'object');
    }
};

UIS.isDefined = function (property) {
    var propertyType = typeof property;
    return propertyType !== 'undefined';
};

UIS.strtolower = function( str ) {
    return (str+'').toLowerCase();
};

UIS.clone = function (mixed) {
    var newObj = (mixed instanceof Array) ? [] : {};
    for (var i in mixed) {
        if (mixed[i] && (typeof mixed[i] == "object") ) {
            newObj[i] = UIS.clone(mixed[i]);
        } else {
            newObj[i] = mixed[i];
        }
    }
    return newObj;
};

UIS.isIE = function() {
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        return true;
    }
};

UIS.getInternetExplorerVersion = function() {

    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    }
    return rv;
};

UIS.strpos = function(haystack, needle, offset) {
    var i = (haystack+'').indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
};

UIS.trim = function (str, charlist) {
    var whitespace, l = 0, i = 0;
    str += '';
    if (!charlist) {
        // default list
        whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
    } else {
        charlist += '';
        whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
    }

    l = str.length;
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }

    l = str.length;
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};



UIS.setCookie =  function (name,value,days,path,domain,secure) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));

    document.cookie = name + "=" + escape (value) +
        ((days) ? "; expires=" + date.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
};

UIS.readAllCookies = function() {
    var jar = {};
    var ca = document.cookie.split(';');

    if (ca) {
        for( var i=0;i < ca.length;i++ ) {

            var cat = UIS.trim(ca[i]);
            var pos = UIS.strpos(cat, '=');
            var key = cat.substring(0,pos);
            var value = cat.substring(pos+1, cat.length);
            if ( ! jar.hasOwnProperty(key) ) {
                jar[key] = [];
            }
            jar[key].push(value);
        }
        return jar;
    }
};


/**
 * 取cookie
 **/
UIS.getCookie = function (name) {
    var jar = UIS.readAllCookies();
    if ( jar ) {
        if ( jar.hasOwnProperty(name) ) {
            return jar[name][0];
        } else {
            return '';
        }
    }
};

UIS.isDebug =  false;

UIS.debug = function() {
    if ( this.isDebug ) {
        if( window.console ) {
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

UIS.urlEncode =  function(str){
    str = (str+'').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
};

UIS.urlDecode = function(str){
    return decodeURIComponent(str.replace(/\+/g, '%20'));
};

UIS.sprintf = function(){
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        if (!chr) {chr = ' ';}
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') {return '%';}

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
                case ' ': positivePrefix = ' '; break;
                case '+': positivePrefix = '+'; break;
                case '-': leftJustify = true; break;
                case "'": customPadChar = flags.charAt(j+1); break;
                case '0': zeroPad = true; break;
                case '#': prefixBaseX = true; break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd':
                number = parseInt(+value, 10);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G':
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);

};

// 对象方法
UIS.fn = UIS.prototype;

UIS.fn.setOption = function(name, value) {
    this.config[name] = value;
};

UIS.fn.getOption = function(name) {
    return this.config[name];
};

UIS.fn.getCookieName = function(name){
    return this.config['configCookieNamePrefix'] + name + '.' + this.config['siteId'];
};

UIS.fn.prepareRequestData = function( properties ) {

    var data = {};

    for ( var param in properties ) {
        var value = '';
        if ( properties.hasOwnProperty( param ) ) {
            if ( UIS.is_array( properties[param] ) ) {
                var n = properties[param].length;
                for ( var i = 0; i < n; i++ ) {
                    if ( UIS.is_object( properties[param][i] ) ) {
                        for ( var o_param in properties[param][i] ) {
                            data[ UIS.sprintf( '%s[%s][%s]', param, i, o_param ) ] = UIS.urlEncode( properties[ param ][ i ][ o_param ] );
                        }
                    } else {
                        // what the heck is it then. assume string
                        data[ UIS.sprintf('%s[%s]', param, i) ] = UIS.urlEncode( properties[ param ][ i ] );
                    }
                }
                // assume it's a string
            } else {
                data[ UIS.sprintf('%s', param) ] = UIS.urlEncode( properties[ param ] );
            }
        }
    }
    return data;
},

UIS.fn.prepareRequestDataForGet = function( properties ) {
    var properties = this.prepareRequestData( properties );
    var get = '';
    for ( var param in properties ) {
        if ( properties.hasOwnProperty( param ) ) {
            var kvp = '';
            kvp = UIS.sprintf('%s=%s&', param, properties[ param ] );
            get += kvp;
        }
    }
    return get;
};

UIS.fn._parseRequestUrl = function(properties) {

    var params = this.prepareRequestDataForGet( properties );

    var log_url = this.getOption('trackerUrl');//this.getLoggerEndpoint();

    if (log_url.indexOf('?') === -1) {
        log_url += '?';
    } else {
        log_url += '&';
    }
    var full_url = log_url + params;
    return full_url;
};

UIS.fn.getIframeDocument = function ( iframe ) {
    var doc = null;
    if( iframe.contentDocument ) {
        // Firefox, Opera
        doc = iframe.contentDocument;
    } else if( iframe.contentWindow && iframe.contentWindow.document ) {
        // Internet Explorer
        doc = iframe.contentWindow.document;
    } else if(iframe.document) {
        // Others?
        doc = iframe.document;
    }

    // If we did not succeed in finding the document then throw an exception
    if( doc == null ) {
        UIS.debug("Document not found, append the parent element to the DOM before creating the IFrame");
    }

    doc.open();
    doc.close();

    return doc;
};

UIS.fn.postFromIframe = function( ifr, data ) {

    var post_url = this.getOption('trackerUrl'); //this.getLoggerEndpoint();
    var doc = this.getIframeDocument(ifr);
    // create form
    //var frm = this.createPostForm();
    var form_name = 'post_form' + Math.random();

    // cannot set the name of an element using setAttribute
    if ( UIS.isIE()  && UIS.getInternetExplorerVersion() < 9.0 ) {
        var frm = doc.createElement('<form name="' + form_name + '"></form>');
    } else {
        var frm = doc.createElement('form');
        frm.setAttribute( 'name', form_name );
    }

    frm.setAttribute( 'id', form_name );
    frm.setAttribute("action", post_url);
    frm.setAttribute("method", "POST");

    // create hidden inputs, add them to form
    for ( var param in data ) {
        if (data.hasOwnProperty(param)) {
            // cannot set the name of an element using setAttribute
            if ( UIS.isIE() && UIS.getInternetExplorerVersion() < 9.0 ) {
                var input = doc.createElement( "<input type='hidden' name='" + param + "' />" );
            } else {
                var input = document.createElement( "input" );
                input.setAttribute( "name",param );
                input.setAttribute( "type","hidden");
            }
            input.setAttribute( "value", data[param] );
            frm.appendChild( input );
        }
    }
    // add form to iframe
    doc.body.appendChild( frm );

    //submit the form inside the iframe
    doc.forms[form_name].submit();

    // remove the form from iframe to clean things up
    doc.body.removeChild( frm );
};

/**
 * Generates a hidden 1x1 pixel iframe
 */
UIS.fn.generateHiddenIframe = function ( parentElement, data ) {

    var iframe_name = 'uis-tracker-post-iframe';

    if ( UIS.isIE() && UIS.getInternetExplorerVersion() < 9.0 ) {
        var iframe = document.createElement('<iframe name="' + iframe_name + '" scr="about:blank" width="1" height="1"></iframe>');
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
    if ( parentElement == null ) {
        parentElement = document.body;
    }
    // This is necessary in order to initialize the document inside the iframe
    parentElement.appendChild( iframe );

    // set a timer to check and see if the iframe is fully loaded.
    // without this there is a race condition in IE8
    var timer = setInterval( function() {

        var doc = that.getIframeDocument( iframe );

        if ( doc ) {
            that.postFromIframe(iframe, data);
            clearInterval(timer);
        }

    }, 1 );

    // needed to cleanup history items in browsers like Firefox

    var cleanuptimer = setInterval( function() {
        parentElement.removeChild(iframe);
        clearInterval(cleanuptimer);
    }, 1000 );

};


UIS.fn.cdPost = function ( data ) {

    var container_id = "uis-tracker-post-container";
    var post_url = this.getOption('trackerUrl'); //this.getLoggerEndpoint();

    var iframe_container = document.getElementById( container_id );

    // create iframe container if necessary
    if ( ! iframe_container ) {

        // create post frame container
        var div = document.createElement( 'div' );
        div.setAttribute( 'id', container_id );
        document.body.appendChild( div );
        iframe_container = document.getElementById( container_id );
    }

    // create iframe and post data once its fully loaded.
    this.generateHiddenIframe( iframe_container, data );
};

UIS.fn._getTarget = function(e) {

    // Determine the actual html element that generated the event
    var targ = e.target || e.srcElement;

    if( typeof targ == 'undefined' || targ==null ) {
        return null; //not all ie events provide srcElement
    }
    if (targ.nodeType == 3) {
        targ = target.parentNode;
    }
    return targ;
};

UIS.fn.findPosX = function(obj) {
    var curleft = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    }
    else if (obj.x)
        curleft += obj.x;
    return curleft;
};

UIS.fn.findPosY = function(obj) {
    var curtop = 0;
    if (obj.offsetParent){
        while (obj.offsetParent){
            curtop += obj.offsetTop
            obj = obj.offsetParent;
        }
    }
    else if (obj.y)
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


UIS.fn.urlFixup = function(hostName, href, referrer) {
    if (!hostName) {
        hostName = '';
    }
    if (!href) {
        href = '';
    }
    if (hostName === 'translate.googleusercontent.com') {       // Google
        if (referrer === '') {
            referrer = href;
        }
        href = this.getParameter(href, 'u');
        hostName = this.getHostName(href);
    } else if (hostName === 'cc.bingj.com' ||                   // Bing
        hostName === 'webcache.googleusercontent.com' ||    // Google
        hostName.slice(0, 5) === '74.6.') {                 // Yahoo (via Inktomi 74.6.0.0/16)
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
UIS.fn.logEvent = function(properties, block, callback){

        // append site_id to properties
        // properties.site_id = this.getSiteId();

        var url = this._parseRequestUrl(properties);
        var limit = this.getOption('getRequestCharacterLimit');
        if ( url.length > limit ) {
            //this.cdPost( this.prepareRequestData( properties ) );
            var data = this.prepareRequestData( properties );
            this.cdPost( data );
        } else {
            UIS.debug('url : %s', url);
            var image = new Image(1, 1);
            //expireDateTime = now.getTime() + delay;
            image.onLoad = function () { };
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


UIS.fn.clickEventHandler = function(e) {

    // hack for IE
    e = e || window.event;

    var click = new UISEvent(this);
    // set event type
    click.setEventType("click");
    // click.setAction('click');
    var targ = this._getTarget(e)
    var dom_value = '(not set)';
    var click_id = click.generateRandomUuid();
    click.setAction(click_id);

    if ( targ.hasOwnProperty && targ.hasOwnProperty( 'value' ) && targ.value.length > 0 ) {
        dom_value = targ.value;
    }
    // click.setName(dom_value);
    // click.set('click_pos', this.findPosX(targ) + ',' + this.findPosY(targ));
    click.set('click_text', targ.innerText);


    // click.set('click_value', targ.innerText);
    //click.setValue(this.findPosX(targ) + ',' + this.findPosY(targ));
    // //clicked DOM element properties
    // var targ = this._getTarget(e);
    //
    // var dom_name = '(not set)';
    if ( targ.hasOwnProperty && targ.hasOwnProperty( 'name' ) && targ.name.length > 0 ) {
        click.set('click_name', targ.name);
    }
    // click.set("dom_element_name", dom_name);
    //
    // var dom_value = '(not set)';
    if ( targ.hasOwnProperty && targ.hasOwnProperty( 'value' ) && targ.value.length > 0 ) {
        // dom_value = targ.value;
        click.set('click_value', targ.value);
    }
    // click.set("dom_element_value", dom_value);
    //
    // var dom_id = '(not set)';
    if ( targ.hasOwnProperty && targ.hasOwnProperty( 'id' ) && targ.id.length > 0) {
        click.set('click_id', targ.id);
    }
    // click.set("dom_element_id", dom_id);
    //
    // var dom_class = '(not set)';
    if ( targ.className && targ.className.length > 0) {
        click.set('click_class', targ.className);
    }
    // click.set("dom_element_class", dom_class);
    //
    click.set("click_tag", UIS.strtolower(targ.tagName));
    // click.set("page_url", window.location.href);
    // view port dimensions - needed for calculating relative position
    // var viewport = this.getViewportDimensions();
    // click.set("page_width", viewport.width);
    // click.set("page_height", viewport.height);
    // var properties = this.getDomElementProperties(targ);
    // click.merge(this.filterDomProperties(properties));
    // // set coordinates
    // click.set("dom_element_x", this.findPosX(targ) + '');
    // click.set("dom_element_y", this.findPosY(targ) + '');
    // var coords = this.getCoords(e);
    click.set('click_pos_x', this.findPosX(targ));
    click.set('click_pos_y', this.findPosY(targ));

    // add to event queue is logging dom stream
    // if (this.getOption('trackDomStream')) {
    //     this.addToEventQueue(click)
    // }

    // var full_click = UIS.clone(click);
    //if all that works then log
    // if (this.getOption('logClicksAsTheyHappen')) {
        this.logEvent(click.getProperties());
    // }


    // this.click = full_click;
};

UIS.fn.bindClickEvents = function() {
    if ( ! this.isClickTrackingEnabled ) {
        var that = this;
        // Registers the handler for the before navigate event so that the dom stream can be logged
        if (window.addEventListener) {
            window.addEventListener('click', function (e) {that.clickEventHandler(e);}, false);
        } else if(window.attachEvent) {
            document.attachEvent('onclick', function (e) {that.clickEventHandler(e);});
        }
        this.isClickTrackingEnabled = true;
    }
};

/**
 *监控click事件
 * @param handler
 */
UIS.fn.trackClicks = function(handler) {
    // this.setOption('logClicksAsTheyHappen', true);
    this.bindClickEvents();
};

/**
 * 监控jqueryAjax请求
 * @param jq
 */
UIS.fn.trackJqueryAjax = function(jq){
    var self = this;
    var ajaxBack = jq.ajax;
    jq.ajax = function(setting){
        var cb = setting.complete;
        var begin = new Date().getTime(),
            url = setting['url'];
        setting.beforeSend =  function(xhr){
            xhr.setRequestHeader("Action-Id", window.action_id);
        }
        setting.complete = function(data, textStatus, request){
            var oneTime = new Date().getTime();
            var ajax_id = data.getResponseHeader("txID");
            var actionId = data.getResponseHeader("Action-Id");
            var clength = data.getResponseHeader("Content-Length");
            if(jq.isFunction(cb)){cb.apply(this, arguments)}
            var twoTime = new Date().getTime();
            var ajax_timing = twoTime - begin;
            var event = new UISEvent(self);

            event.setEventType("ajax");
            event.setAction(actionId);
            event.set('ajax_id', ajax_id);
            event.set('content_length' , clength || 0);
            event.set('ajax_tm' , ajax_timing);

            event.set('url_ajax',url);
            self.logEvent(event.getProperties())
        };
        return ajaxBack(setting);
    }
};

UIS.fn._trackRouterEvent = function(event){
    var  locationArray = this.urlFixup(document.domain, window.location.href, this.getReferrer());
    //var locationHrefAlias = decodeURIComponent(locationArray[1]);
    var configReferrerUrl = decodeURIComponent(locationArray[2]);
    event.set('url',window.location.href);
    if (configReferrerUrl)
        event.set("url_ref", configReferrerUrl);
};

UIS.fn.trackRouter = function(){
    var that = this;
    var hashChangeFunc = function(e){
        var event = new UISEvent(that);
        event.setEventType("page_route");
        // event.setAction("");
        that._trackRouterEvent(event);
        that.logEvent(event.getProperties());
    };
    var popstateFunc = function(e){
        var event = new UISEvent(that);
        event.setEventType("page_route");
        // event.setAction("");
        that._trackRouterEvent(event);
        that.logEvent(event.getProperties());
    };

    if (typeof window.onhashchange != 'undefined'){
        if (window.addEventListener) {
            window.addEventListener('hashchange', hashChangeFunc, false);
        } else if(window.attachEvent) {
            window.attachEvent('onhashchange', hashChangeFunc);
        }
  };
    if (typeof window.onpopstate != 'undefined'){
        if (window.addEventListener) {
            window.addEventListener('popstate', popstateFunc, false);
        } else if(window.attachEvent) {
            window.attachEvent('onpopstate', popstateFunc);
        }
    };
    if (window.history.pushState){
        window.history._pushState = window.history.pushState;
        window.history.pushState = function(state, title, url){
            window.history._pushState(state, title, url);
            var event = new UISEvent(that);
            event.setEventType("page_route");
            // event.setAction("");
            that._trackRouterEvent(event);
            that.logEvent(event.getProperties());
        }
    }
    if (window.history.replaceState){
        window.history._replaceState = window.history.replaceState;
        window.history.replaceState = function(state, title, url){
            window.history._replaceState(state, title, url);
            var event = new UISEvent(that);
            event.setEventType("page_route");
            // event.setAction("");
            that._trackRouterEvent(event);
            that.logEvent(event.getProperties());
        }
    }
};

UIS.fn.trackPageLoad = function(){
    var that = this;
    var event = new UISEvent(this);
    var myTime = window.timing.getTimes();
    if(myTime.loadTime > 0){
        //var load_tm = myTime.loadTime;
        var action_id = event.generateRandomUuid();
        event.setEventType("page_load");
        event.setAction(action_id);
        event.set('t_unload', myTime.t_unload || 0);
        event.set('t_redirect', myTime.t_redirect || 0);
        event.set('t_dns', myTime.t_dns || 0);
        event.set('t_tcp', myTime.t_tcp || 0);
        event.set('t_request', myTime.t_request || 0);
        event.set('t_response', myTime.t_response || 0);
        event.set('t_paint', myTime.t_paint || 0);
        event.set('t_dom', myTime.t_dom || 0);
        event.set('t_domready', myTime.t_domready || 0);
        event.set('t_load', myTime.t_load || 0);
        event.set('t_onload', myTime.t_onload || 0);
        event.set('t_white', myTime.t_white || 0);
        event.set('t_all', myTime.t_all || 0);
        this.logEvent(event.getProperties());
    }else{
        setTimeout(function(){that.trackPageLoad()},400);
    }
};

UIS.fn.log = function(params){
    if (typeof params != 'object') return;
    var event = new UISEvent(this);
    for (var key in params){
        if (key.indexOf('ext') == 0){
            event.set(key, params[key])
        }
    }
    this.logEvent(event.getProperties());
};

UIS.fn.trackError = function(){
    window.onerror = function(msg,url,line,col,error){
        if (msg != "Script error." && !url){
            return true;
        }
        setTimeout(function(){
            var data = {};
            col = col || (window.event && window.event.errorCharacter) || 0;
            data.url = url;
            data.line = line;
            data.col = col;
            if (!!error && !!error.stack){
                data.msg = error.stack.toString();
            }else if (!!arguments.callee){
                var ext = [];
                var f = arguments.callee.caller, c = 3;
                while (f && (--c>0)) {
                    ext.push(f.toString());
                    if (f  === f.caller) {
                        break;
                    }
                    f = f.caller;
                }
                ext = ext.join(",");
                data.msg = ext;
            }
            var uis = window.uis || new UIS();
            var event = new UISEvent(uis);
            event.setEventType("jserror");
            event.set("error_js", data.url);
            event.set("error_line", data.line);
            event.set("error_col", data.col);
            event.set("error_msg", data.msg);
            uis.logEvent(event.getProperties());
        },0)
        //return true;
    };
}

