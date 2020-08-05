import moment from 'moment'
import { Base64 } from 'js-base64';
import TraceMonitor from './traceMonitor';
export default class Span {
  constructor (id, name, pSpanId, traceId, params) {
    const defaultData = {
      spanId: id,
      pSpanId: pSpanId,
      traceId: traceId,
      msg: '',
      // http_body: '',
      http_res_body: '',
      http_res_code: '',
      reqQueryString: '',
      cost: '',
      reqUrl: '',
      exception: '',
      ts: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss.SSS'),
      uid: cb.utils.getCookie('mdd_monitor_uid'),
      // uid: 'a12345678',
      userId: cb.utils.getCookie('yonyou_uid'),
      tenantId: cb.utils.getCookie('tenantid'),
      logtype: 'client',
      // billParam: '',
      // http_header: "",
      // agentId: "",
      // code: "",
      // connection_id: "",
      // downBoundBytes: "",
      // jdbc_url: "",
      // level: "",
      // logger36: "",
      // mdd_req_id: "",
      // profile: "",
      // rows: "",
      // rpcOccurrence: "",
      // ruleAction: "",
      // ruleContext: "",
      // ruleDetail: "",
      // ruleId: "",
      // ruleMsgCode: "",
      // ruleName: "",
      // "spring.application.name": "",
      // "spring.domain.name": "",
      // sql: "",
      // sqlType: "",
      // sysId: "",
      // thread: "",
      // trace_time_finish: "",
      // trace_time_start: "",
      // upBoundBytes: "",
    };
    this.logData = [];
    this.data = { ...defaultData, id, name, pSpanId, traceId, ...params };
    this.children = [];
    if (!window.__TRACEMONITOR__) {
      window.__TRACEMONITOR__ = [];
    }
  }

  id (id) {
    if (typeof id != 'undefined') {
      this.data.id = id;
      this.data.spanId = id;
    } else {
      return this.data.id;
    }
  }

  pid (pid) {
    if (typeof pid != 'undefined') {
      this.data.pSpanId = pid;
    } else {
      return this.data.pSpanId;
    }
  }

  traceid (traceid) {
    if (typeof traceid != 'undefined') {
      this.data.traceId = traceid;
    } else {
      return this.data.traceId;
    }
  }

  createChild (displayName, params) {
    const span = TraceMonitor.getInstance().createSpan(TraceMonitor.getInstance().uuid(), displayName, this.id(), this.data.traceId, params);
    this.children.push(span);
    return span;
  }

  log (displayName, params) {
    if (cb.utils.getCookie('mdd_monitor_record') != 'true') return;
    const info = { ...this.data, msg: Base64.encode(displayName), name: displayName, ts: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss.SSS'), ...params};
    if (params.http_body) {
      info.http_body = Base64.encode(params.http_body)
    }
    this.logData.push(info);
    let currentLog = info;
    if (this.logData.length > 1) { // 计算时间间隔
      currentLog = this.logData[this.logData.length - 1];
      const costTime = moment(currentLog.ts).diff(moment(this.logData[0].ts), 'milliseconds');
      currentLog.cost = costTime;
    }
    window.__TRACEMONITOR__.push(currentLog);
    this.record(currentLog, window.__TRACEMONITOR__.length);
    return console.log(JSON.stringify(currentLog));
  }

  record (data, index) {
    // console.log('record data', data);
    const proxy = cb.rest.DynamicProxy.create({
      getMonitor: {
        url: 'collect/api/v1/yyeye/spans',
        method: 'PUT',
        options: {
          uniform: false
        }
      },
    });
    const arr = [];
    arr.push({
      data: JSON.stringify(data),
      line: index,
      version: '1.0.0'
    });
    proxy.getMonitor(arr, function (err, result) {
      if (err) {
        cb.utils.alert('请求数据失败');
      }
    });
  }
}
