# iuap-insight

端到端数据采集整体方案

## 如何使用

### 直接引入

将项目中lib下的`iuap-insight.js`使用script标签引入即可正常使用

### 如果配置

在页面中做如下配置：
```
var uis = new UIS();
uis.setOption("trackerUrl", 'http://172.20.13.81:8080/browserInsight/collect');
uis.setOption("userId","testUserId");
uis.setOption("siteId","mysite1");
uis.trackClicks();
uis.trackRouter();
uis.trackPageLoad();
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
`.trackJqueryAjax($)` : 监听jquery的ajax事件，参数为jquery对象。需要先引入jquery，才能调用此方法。



### npm 下载

```
$ npm install iuap-insight
```

## 如何开发

```
$ npm install
$ npm run dev
```

产出资源

```
$ npm run build
```
