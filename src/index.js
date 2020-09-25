/**
 * @name 名称: iuap-insight
 * @description 描述: 技术中台Hubble前端异常数据、性能数据、分布式链路数据的采集上报SDK---- iuap-insight.js
 * @date 更新日期：2020-08-05
 * @version：V2.0
 */

import UIS from './UIS.js'
import Hubble from "./hubble/index.js"
import TraceMonitor from './monitor/traceMonitor.js'
import * as rrwebAPI from './rrweb'

import {hook, unHook} from "./request-hook/ajax-hook";
import {proxy, unProxy} from "./request-hook/proxy-hook";

const monitor = TraceMonitor.getInstance()
const uis = new UIS();
const hubble = new Hubble()

// window.uis = uis || {}
window.uis = { start: () => { } }
window.hubble = hubble
window.rrweb = rrwebAPI || {}
window.monitor = monitor || {}

uis.monitor = monitor
uis.rrweb = rrweb

// Object.assign(uis, {hook, unHook, proxy, unProxy})

export default uis