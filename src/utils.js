
export function utf8_encode(argString) {
    return decodeURI(encodeURIComponent(argString));
}

export function hash(str) {
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   jslinted by: Anthon Pang (http://piwik.org)

    var
        rotate_left = function(n, s) {
            return (n << s) | (n >>> (32 - s));
        },

        cvt_hex = function(val) {
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
 * 判断是否是数组
 * @param input
 * @returns {boolean}
 */
export const is_array = function(input) {
    return typeof(input) == 'object' && (input instanceof Array);
};

/**
 * 是否是对象
 * @param mixed_var
 * @returns {boolean}
 */
export const is_object = function(mixed_var) {
    if (mixed_var instanceof Array) {
        return false;
    } else {
        return (mixed_var !== null) && (typeof(mixed_var) == 'object');
    }
};

export const isDefined = function(property) {
    var propertyType = typeof property;
    return propertyType !== 'undefined';
};

export const strtolower = function(str) {
    return (str + '').toLowerCase();
};

export const clone = function(mixed) {
    var newObj = (mixed instanceof Array) ? [] : {};
    for (var i in mixed) {
        if (mixed[i] && (typeof mixed[i] == "object")) {
            newObj[i] = clone(mixed[i]);
        } else {
            newObj[i] = mixed[i];
        }
    }
    return newObj;
};

export const isIE = function() {
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        return true;
    }
};

export const getInternetExplorerVersion = function() {

    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
};

export const strpos = function(haystack, needle, offset) {
    var i = (haystack + '').indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
};

export const trim = function(str, charlist) {
    var whitespace, l = 0,
        i = 0;
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



export const setCookie = function(name, value, days, path, domain, secure) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie = name + "=" + escape(value) +
        ((days) ? "; expires=" + date.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
};

export const readAllCookies = function() {
    var jar = {};
    var ca = document.cookie.split(';');

    if (ca) {
        for (var i = 0; i < ca.length; i++) {

            var cat = trim(ca[i]);
            var pos = strpos(cat, '=');
            var key = cat.substring(0, pos);
            var value = cat.substring(pos + 1, cat.length);
            if (!jar.hasOwnProperty(key)) {
                jar[key] = [];
            }
            jar[key].push(value);
        }
        return jar;
    }
};

export const getCookie = function(name) {
    var jar = readAllCookies();
    if (jar) {
        if (jar.hasOwnProperty(name)) {
            return jar[name][0];
        } else {
            return '';
        }
    }
};

export const urlEncode = function(str) {
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
};

export const urlDecode = function(str) {
    return decodeURIComponent(str.replace(/\+/g, '%20'));
};

export const sprintf = function() {
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments,
        i = 0,
        format = a[i++];

    // pad()
    var pad = function(str, len, chr, leftJustify) {
        if (!chr) {
            chr = ' ';
        }
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
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
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {
            '2': '0b',
            '8': '0',
            '16': '0x'
        }[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') {
            return '%';
        }

        // parse flags
        var leftJustify = false,
            positivePrefix = '',
            zeroPad = false,
            prefixBaseX = false,
            customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
                case ' ':
                    positivePrefix = ' ';
                    break;
                case '+':
                    positivePrefix = '+';
                    break;
                case '-':
                    leftJustify = true;
                    break;
                case "'":
                    customPadChar = flags.charAt(j + 1);
                    break;
                case '0':
                    zeroPad = true;
                    break;
                case '#':
                    prefixBaseX = true;
                    break;
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
            case 's':
                return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c':
                return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b':
                return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o':
                return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u':
                return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
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
            default:
                return substring;
        }
    };

    return format.replace(regex, doFormat);

};

const getOS = function (userAgent) {
    if (userAgent.indexOf('Windows Phone') !== -1) {
        return 'Windows Phone';
    }
    if (userAgent.indexOf('Win') !== -1) {
        return 'Windows';
    }
    if (userAgent.indexOf('Android') !== -1) {
        return 'Android';
    }
    if (userAgent.indexOf('Linux') !== -1) {
        return 'Linux';
    }
    if (userAgent.indexOf('X11') !== -1) {
        return 'UNIX';
    }
    if (/iPad|iPhone|iPod/.test(userAgent)) {
        return 'iOS';
    }
    if (userAgent.indexOf('Mac') !== -1) {
        return 'OS X';
    }
}

export const getInfo = function (userAgent) {
    var ua = userAgent || navigator.userAgent;
    var tem;

    var os = getOS(ua);
    var match = ua.match(/(opera|coast|chrome|safari|firefox|edge|trident(?=\/))\/?\s*?(\S+)/i) || [];

    tem = ua.match(/\bIEMobile\/(\S+[0-9])/);
    if (tem !== null) {
        return {
            name: 'IEMobile',
            version: tem[1].split('.')[0],
            fullVersion: tem[1],
            os: os
        };
    }

    if (/trident/i.test(match[1])) {
        tem = /\brv[ :]+(\S+[0-9])/g.exec(ua) || [];
        return {
            name: 'IE',
            version: tem[1] && tem[1].split('.')[0],
            fullVersion: tem[1],
            os: os
        };
    }

    if (match[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);
        if (tem !== null) {
            return {
                name: 'Opera',
                version: tem[1].split('.')[0],
                fullVersion: tem[1],
                os: os
            };
        }

        tem = ua.match(/\bEdg\/(\S+)/) || ua.match(/\bEdge\/(\S+)/);
        if (tem !== null) {
            return {
                name: 'Edge',
                version: tem[1].split('.')[0],
                fullVersion: tem[1],
                os: os
            };
        }
    }
    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];

    if (match[0] === 'Coast') {
        match[0] = 'OperaCoast';
    }

    if (match[0] !== 'Chrome') {
        var tem = ua.match(/version\/(\S+)/i)
        if (tem !== null && tem !== '') {
            match.splice(1, 1, tem[1]);
        }
    }

    if (match[0] === 'Firefox') {
        match[0] = /waterfox/i.test(ua)
            ? 'Waterfox'
            : match[0];
    }

    return {
        name: match[0],
        version: match[1].split('.')[0],
        fullVersion: match[1],
        os: os
    };
}

/**
 * 转化对象为query
 * @param data
 * @returns {*}
 */
export function transToQuery (data) {
    if (typeof data === 'string') {
        return `?${data}`
    }
    let query = '?';
    if (data instanceof Object) {
        let keyAry = Object.keys(data);
        for (let key in data) {
            if (keyAry[keyAry.length - 1] === key) {
                query = `${query}${key}=${data[key]}`;
            } else {
                query = `${query}${key}=${data[key]}&`;
            }

        }
    }
    return query;
}

/**
 * 获取请求URL的host
 * @param url
 */
export function getUrlHost (url) {
    let host = window.location.host;
    try {
        let urlIns = new URL(url)
        host = urlIns.host
    } catch (error) {

    }
    return host
}

/**
 * 获取请求URL的host
 * @param url
 */
export function handleUrlWithOrigin (url = '') {
    if (!url.startsWith("http")) {
        return `${window.location.origin}${url}`
    }
    return url
}

/**
 * 获取字符串的字节数 (UTF8)
 * @param str {String}
 */
export function getStrSize (str = "") {
    let total = 0;

    for (let i = 0, len = str.length; i < len; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode <= 0x007f) {
            total += 1;
        } else if (charCode <= 0x07ff) {
            total += 2;
        } else if (charCode <= 0xffff) {
            total += 3;
        } else {
            total += 4;
        }
    }
    return total;
}

/**
 * 数据上报
 * @param {String}  url 上报地址
 * @param {Object} reportData 上报数据
 * @param {Function} successCb 成功回调
 * @param {Function} errorCb 失败回调
 * @returns {*}
 */
export function post (url, reportData, successCb, errorCb) {
    var xmlreq;
    if (window.XMLHttpRequest) { //非IE
        let XMLHttpRequestConstructor = window._rxhr || XMLHttpRequest
        xmlreq = new XMLHttpRequestConstructor();

    } else if (window.ActiveXObject) { //IE
        try {
            xmlreq = new ActiveXObject("Msxml2.HTTP");
        } catch (e) {
            try {
                xmlreq = new ActiveXObject("microsoft.HTTP");
            } catch (e) {
            }
        }
    }

    xmlreq.onreadystatechange = function (data) {
        if (xmlreq.readyState == 4) {
            if (xmlreq.status == 200) {
                typeof successCb == "function" && successCb(xmlreq.responseText);
            } else {
                typeof errorCb == "function" && errorCb();
            }
        }
    }
    try {
        xmlreq.open('POST', url);
        xmlreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");  //设置请求头
        xmlreq.send(JSON.stringify(reportData));
    } catch (e) {
        typeof errorCb == "function" && errorCb(e);
    }

}