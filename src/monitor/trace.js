import TraceMonitor from './traceMonitor';

export default class Trace {
  constructor (id, name, params) {
    this.data = { id, name, ...params };
    this.children = [];
  }

  static getInstance () {
    if (!this.instance) {
      this.instance = new Trace();
    }
    return this.instance;
  }

  id (id) {
    if (typeof id != 'undefined') {
      this.data.id = id;
    } else {
      return this.data.id;
    }
  }

  traceId () {
    return this.data.traceId;
  }

  data () {
    return this.data;
  }

  createSpan (displayName, params) {
    const span = TraceMonitor.getInstance().createSpan(TraceMonitor.getInstance().uuid(), displayName, null, this.id(), params);
    this.children.push(span);
    return span;
  }

  log (params) {
    const info = { ...this.data, params };
    return console.log(JSON.stringify(info));
  }
}
