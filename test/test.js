import TraceMonitor from './TraceMonitor';

// 1
const trace0 = TraceMonitor.getInstance().createTrace('页面初始化');
trace0.log();
const span0 = trace0().createSpan('dynamic');
span0.log();
trace0().createSpan().log();
trace0().createSpan().log();
trace0().createSpan().log();

// 2
const trace1 = TraceMonitor.getInstance().createTrace('保存按钮点击', { args: { cName: 'button1', cShowCaption: '保存' } });
trace1.log();
const span10 = trace1().createSpan();
span10.log();
trace1().createSpan().log();
trace1().createSpan().log();
trace1().createSpan().log();
