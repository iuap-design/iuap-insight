/**
 * @name 名称: iuap-insight
 * @description 描述: 技术中台Hubble前端异常数据、性能数据、分布式链路数据的采集上报SDK---- iuap-insight.js
 * @date 更新日期：2020-08-05
 * @version：V2.0
 */

import UIS from './UIS.js'
import TraceMonitor from './monitor/traceMonitor.js'
import * as rrwebAPI from './rrweb'

const monitor = TraceMonitor.getInstance()
const uis = new UIS();

window.uis = uis.default || {}
window.rrweb = rrwebAPI.default || {}
window.monitor = monitor || {}

export default uis