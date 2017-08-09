# iuap-insight

端到端数据采集整体方案

## 快速使用

将项目中 src 目录下的`iuap-insight.js`使用script标签引入，如需使用压缩版取 lib 目录下文件即可（最简单方式，直接引入我们提供的资源CDN地址即可）。然后，进行初始化工作即可实现无痕埋点，自动上报数据：

```
<script>
    uis.start({
      trackerUrl: 'your server path',
      userId: '1511676',
      siteId: 'csj',
    });
  </script>
```

配置说明：

`trackerUrl` : 后台监听url  
`userId`: 用户id  
`siteId`: 站点id

## 进阶使用

- 如需手动设置，可以这样：

```
<div id="app" style="background:#ccc;"> 点我发送 </div>
  <div id="root" style="background:#ddd;"> fff </div>
  <script src="http://design.yonyoucloud.com/static/jquery/3.2.1/jquery.js"></script>
  <script type="text/javascript" src="./iuap-insight.js"></script>
  <script>
    uis.start({
      trackerUrl: 'https://developer.yonyoucloud.com/iuapInsight/collect',
      userId:'1511676',
      siteId:'csj',
    });

    $('#app').click(function(e){
      uis.track('click_text', '33333')
    })
    $('#root').click(function(e){
      uis.track('click_text', '9999')
    })
  </script>
```


- 更多方法：  
`uis.trackJqueryAjax($)` : 监听jquery的ajax事件，参数为jquery对象。需要先引入jquery，才能调用此方法。
`uis.log({ext1:'xxx',ext2:'xxx'})` : 用户自定义日志信息，开发者在需要记日志的地方调用此方法，参数只能是: ext1,ext2 ... ext5。


注意事项：

1. 正常的监听方法都可在引入iuap-insight.js后直接调用。对于方法 `.tranckJqueryAjax($)`,要注意，一定先能获取到jquery对象。对于常规html页面，可在引入jquery的script标签之后该用该方法。对于使用AMD或commonJS规范的页面，需要在require jquery模块之后，调用该方法。


