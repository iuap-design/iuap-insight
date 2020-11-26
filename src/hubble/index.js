
/**
 * Hubble 录制类
 */
class Hubble {
  constructor() {

    // Hubble录制的config
    this.config = {
      // 录制结束
      isEnd: false,
      // 倒计时timer
      timer: null,

      // 录制上报url
      url: "https://developer.yonyoucloud.com/hubble/monitor/record",

      //单点性能测试数据上报
      singlePointUrl:"https://developer.yonyoucloud.com/hubble/client-perform",

      // 中间报告url
      reportUrl: `https://developer.yonyoucloud.com/fe/hubble-new/index.html#/hubble-report`,

    };

    // 录屏的config
    this.screenConfig = {
      // 是否开启屏幕录制
      isEnable: true,
      // 倒计时timer
      timer: null,
      // 分段上报录屏信息的timer
      sectionTimer: null,
      // 录制结束调用的函数
      stopFn: null,
      // 存放快照的事件
      events: [],
      // 录屏索引
      count: 0,

      // 录屏上报url
      screenUrl: "https://developer.yonyoucloud.com/screencap/screenDetail.uploadScreenData",
    };


    /*
    setTimeout(() => {
      this._initScreenScr()
    }, 2000);
    */

  }

  _setConfig (key, value) {
    this.config[key] = value
  }

  _getConfig (key) {
    if (this.config.hasOwnProperty(key)) {
      return this.config[key]
    }
    return null
  }

  _setScreenConfig (key, value) {
    this.screenConfig[key] = value
  }

  _getScreenConfig (key) {
    if (this.screenConfig.hasOwnProperty(key)) {
      return this.screenConfig[key]
    }
    return null
  }

  /**
   * @description 随机生成 8 位uid
   */
  _generateUID () {
    var sessions = [];
    var clientID = '';
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    var numPossible = possible.length;
    do {
      for (var i = 0; i < 8; i++) {
        clientID += possible.charAt((Math.random() * numPossible) | 0);
      }
    } while (sessions['clientID'] != null);
    return clientID;
  }


  /**
   * 开始录制 结束录制各调用一次
   */
  _toggleRecord () {
    let isDiwork = Object.prototype.toString.call(window.jDiwork) === "[object Object]"
    && window.jDiwork.getContext
    && typeof window.jDiwork.getContext === "function";

    let recordUrl = `${this.config.url}?uid=${this._getCookie("mdd_monitor_uid")}&isDiwork=${isDiwork}&host=${window.location.host}`;
    const startId = "hubble_record_script"

    let $startScript = document.getElementById(startId)
    if ($startScript) {
      document.body.removeChild(document.getElementById(startId))
    }
    $startScript = document.createElement("script")
    $startScript.id = startId
    $startScript.src = recordUrl
    document.body.appendChild($startScript)
  }

  /**
   * 获取Cookie
   */
  _getCookie (name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) {
      return arr[2];
    }
    return '';
  }

  /**
   * 设置Cookie
   */
  _setCookie (name, value, domain) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 30);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";domain=" + domain + `;path=/`;
  }

  /**
   * 获取主域名
   */
  _getMainHost () {
    return document.domain
    let key = `mh_${Math.random()}`;
    let keyR = new RegExp(`(^|;)\\s*${key}=12345`);
    let expiredTime = new Date(0);
    let domain = document.domain;
    let domainList = domain.split('.');

    let urlItems = [];
    // 主域名一定会有两部分组成
    urlItems.unshift(domainList.pop());
    // 慢慢从后往前测试
    while (domainList.length) {
      urlItems.unshift(domainList.pop());
      let mainHost = urlItems.join('.');
      let cookie = `${key}=${12345};domain=.${mainHost}`;

      document.cookie = cookie;

      //如果cookie存在，则说明域名合法
      if (keyR.test(document.cookie)) {
        document.cookie = `${cookie};expires=${expiredTime}`;
        return mainHost;
      }
    }
  }



  /**
   * 到达最大时间后结束录制
   */
  _stopByTimer () {
    this._setConfig("isEnd", true)
    this._toggleRecord()

    clearTimeout(this._getConfig("timer"))
    this._setConfig("timer", null)

    let reportUrl = `${this.config.reportUrl}?uid=${this._getCookie("mdd_monitor_uid")}`
    window.open(reportUrl)
  }

  /**
   * 初始化录屏的静态资源脚本
   */
  _initScreenScr () {
    if (document.getElementById("hubble-snapshot-record")) {
      return
    }
    var recordCDN = "https://yonyoucloud-developer-center-docker-registry.oss-cn-beijing.aliyuncs.com/web/hubble-snapshot-record.js"
    var snapShotScript = document.createElement("script")
    snapShotScript.id = "hubble-snapshot-record"
    snapShotScript.src = recordCDN
    document.body.appendChild(snapShotScript)
  }

  /**
   * 开始录屏
   */
  _startRecordScreen () {
    if (typeof rrwebRecord === "undefined") return
    let _self = this;

    this._screenStopFn = rrwebRecord({
      emit (event) {
        let curCount = _self._getScreenConfig('count')
        _self._setScreenConfig('count', curCount + 1)

        _self.screenConfig.events.push(event)
      },
    });

    this._uploadScreenDataByTimer()

    this.screenConfig.timer = setTimeout(() => {

      this._stopRecordScreen()

    }, 1000 * 60);

  }

  _stopRecordScreen () {
    this._screenStopFn && this._screenStopFn()

    this._setScreenConfig('count', 0)
    this._setScreenConfig('events', [])

    clearTimeout(this.screenConfig.sectionTimer)
    this._setScreenConfig('sectionTimer', null)

    clearTimeout(this.screenConfig.timer)
    this._setScreenConfig('timer', null)
  }


  _uploadScreenDataByTimer () {
    this.screenConfig.sectionTimer = setTimeout(() => {
      this._uploadScreenData()
      this._uploadScreenDataByTimer()
    }, 1000 * 2);
  }

  _uploadScreenData () {

    let uploadUrl = this._getScreenConfig("screenUrl")
    let curCount = this._getScreenConfig('count')
    let curEvents = this._getScreenConfig('events')

    var startIndex = curCount - (curEvents.length || 1)
    var endIndex = curCount - 1
    var uploadData = {
      uid: this._getCookie("mdd_monitor_uid"),
      type: "snapShot",
      data: curEvents,
      // index: `${startIndex}-${endIndex}`,
      start: startIndex,
      end: endIndex
    }
    if (Array.isArray(curEvents) && curEvents.length) {
      this.put(uploadUrl, JSON.stringify(uploadData))
    }

    this._setScreenConfig('events', [])

  }

  put (url, putData, successCb, errorCb) {
    var xmlreq;
    if (window.XMLHttpRequest) { //非IE
      xmlreq = new XMLHttpRequest();

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
      xmlreq.open('PUT', url);
      xmlreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");  //设置请求头
      xmlreq.send(putData);
    } catch (e) {
      typeof errorCb == "function" && errorCb(e);
    }

  }

  /**
   * 私有化时的初始化
   */
  privateInit ({ domain = "" }) {
    if (domain) {
      this._setConfig("url", `${domain}/hubble/monitor/record`)
      this._setConfig("reportUrl", `${domain}/fe/hubble-new/index.html#/hubble-report`)
      this._setConfig("singlePointUrl", `${domain}/hubble/client-perform`)
    }
  }

  /**
  * 开始录制
  */
  startRecord ({ isEnableScreen = true } = {}) {
    this._setConfig("isEnd", false)
    this._setCookie("mdd_monitor_uid", this._generateUID(), this._getMainHost())
    this._setCookie("mdd_monitor_record", "true", this._getMainHost())
    this._toggleRecord()

    this._setScreenConfig("isEnable", !!isEnableScreen)
    if (!!isEnableScreen) {
      console.log("enable screen")
      this._startRecordScreen()
    }
    this.config.timer = setTimeout(() => {
      this._stopByTimer()
    }, 1000 * 60 * 5);
  }

  /**
   * 结束录制
   */
  stopRecord (obj) {
    let reportUrl = `${this.config.reportUrl}?uid=${this._getCookie("mdd_monitor_uid")}`;
    if (this.config.timer) {
      clearTimeout(this.config.timer)
      this.config.timer = null
    }
    if (!this._getConfig("isEnd")) {
      this._toggleRecord()
    }

    if (this._getScreenConfig("isEnable")) {
      this._stopRecordScreen()
    }
    //判断是否打开中间页
    if(!obj || obj.isOpen){
      window.open(reportUrl)
    }
    
    this._setCookie("mdd_monitor_uid", "", this._getMainHost())
    this._setCookie("mdd_monitor_record", "false", this._getMainHost())
  }



  /**
   * 录制是否开始了
   */
  isRecording () {
    return this._getCookie("mdd_monitor_record") === "true"
  }

    /**
   * 查询开始时间和结束时间
   */
  getTimeRange (item) {
    
    console.log("单点性能测试开始",item)
    post(`${this.config.singlePointUrl}`,item,()=>{console.log("上报成功")})
  }



}

export default Hubble