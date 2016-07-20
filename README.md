# iuap-insight

端到端数据采集整体方案

## 如何使用

### 1. 引入js文件

将项目中lib下的`iuap-insight.js`使用script标签引入即可正常使用

### 2. 配置监听

在页面中做如下配置：
```
window.uis = new UIS();
uis.setOption("trackerUrl", 'http://172.20.13.81:8080/browserInsight/collect');
uis.setOption("userId","testUserId");
uis.setOption("siteId","mysite1");
uis.trackClicks();
uis.trackRouter();
uis.trackPageLoad();
uis.trackError();
uis.trackJqueryAjax($);
```

配置说明：

`trackerUrl` : 后台监听rul  
`userId`: 用户id  
`siteId`: 站点id

方法：  
`.trackClicks()` : 监听鼠标点击   
`.trackRouter()` : 监听路由变化  
`.trackPageLoad()` : 监听页面加载  
`.trackError()` : 监听页面错误
`.trackJqueryAjax($)` : 监听jquery的ajax事件，参数为jquery对象。需要先引入jquery，才能调用此方法。
`.log({ext1:'xxx',ext2:'xxx'})` : 用户自定义日志信息，开发者在需要记日志的地方调用此方法，参数只能是: ext1,ext2 ... ext5。


注意事项：

1. 正常的监听方法都可在引入iuap-insight.js后直接调用。对于方法 `.tranckJqueryAjax($)`,要注意，一定先能获取到jquery对象。对于常规html页面，可在引入jquery的script标签之后该用该方法。对于使用AMD或commonJS规范的页面，需要在require jquery模块之后，调用该方法。


