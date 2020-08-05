import { hash } from './utils'

/**
 *事件类
 */

const UISEvent = function(uis) {
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
    this.set('site_id', uis.getOption('siteId'));
    // this.set('rec',1);
    // this.set('r',String(Math.random()).slice(2, 8));
    this.set('client_ts', now.getTime());
    // this.set('url',now.getSeconds());
    // this.set('urlref',now.getSeconds());
    // this.set('s',now.getSeconds());
    if (userId)
        this.set('user_id', userId);
    this.set('visitor_id', cookieVisitorIdValues.uuid);
    // this.set('_idts', cookieVisitorIdValues.createTs);
    // this.set('_idvc', cookieVisitorIdValues.visitCount);
    // this.set('_idn', cookieVisitorIdValues.newVisitor);
    this.set('res', window.screen.width + ' * ' + window.screen.height);
    this.set('res_x', window.screen.width);
    this.set('res_y', window.screen.height);
    this.set('page_title', document.title);
    var locationArray = uis.urlFixup(document.domain, window.location.href, uis.getReferrer());
    var configReferrerUrl = decodeURIComponent(locationArray[2]);
    this.set('url', window.location.href);
    if (configReferrerUrl)
        this.set("url_ref", configReferrerUrl);
    this.set("host", window.location.host);


}

UISEvent.prototype = {
    get: function(name) {
        if (this.properties.hasOwnProperty(name)) {
            return this.properties[name];
        }
    },

    set: function(name, value) {
        this.properties[name] = value;
    },

    setEventType: function(event_type) {
        this.set("type", event_type);
    },

    setAction: function(action) {
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

    getProperties: function() {
        return this.properties;
    },

    merge: function(properties) {
        for (param in properties) {
            if (properties.hasOwnProperty(param)) {
                this.set(param, properties[param]);
            }
        }
    },

    isSet: function(name) {
        if (this.properties.hasOwnProperty(name)) {
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
    loadVisitorIdCookie: function() {
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

        if (!visitorId) {
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
    getVisitorId: function() {
        return this.getValuesFromVisitorIdCookie().uuid;
    },
    loadReferrerAttributionCookie: function() {
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

export default UISEvent