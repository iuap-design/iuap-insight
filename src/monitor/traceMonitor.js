import Trace from './trace';
import Span from './span';
export default class TraceMonitor {
  constructor () {
    this.instance = null;
    this._data_tree = [];
    this._indexes = {};
    // this.name = name;
    // this.creator = creator;
    // this.products = products;
    if (window) {
      if (!window.__TRACEMONITOR_TREE__) {
        window.__TRACEMONITOR_TREE__ = [];
      }
      this._data_tree = window.__TRACEMONITOR_TREE__;

      if (!window.__TRACEMONITOR_INDEXES__) {
        window.__TRACEMONITOR_INDEXES__ = {};
      }
      this._indexes = window.__TRACEMONITOR_INDEXES__;
    }
  }

  static getInstance () {
    if (!this.instance) {
      this.instance = new TraceMonitor();
    }
    return this.instance;
  }

  uuid () {
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
      const num = parseInt(Math.random() * 16);
      return num.toString(16);
    });
  }

  data () {
    return this._indexes;
  }

  createTrace (displayName, params) {
    if (cb.utils.getCookie('mdd_monitor_record') != 'true') return;
    const id = this.uuid();
    const trace = new Trace(id, displayName, params);
    this._data_tree.push(trace);
    this._indexes[id] = trace;
    return trace;
  }

  createSpan (id, displayName, pid, traceId, params) {
    if (cb.utils.getCookie('mdd_monitor_record') != 'true') return;
    const span = new Span(id, displayName, pid, traceId, params);
    return span;
  }
}
