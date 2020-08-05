# iuap-insight 用友技术中台Hubble全链路数据采集JSSDK

## 快速使用

将项目中 src 目录下的`iuap-insight.js`使用script标签引入，如需使用压缩版取 dist 目录下文件即可（最简单方式，直接引入我们提供的资源CDN地址即可）。然后，进行初始化工作即可实现无痕埋点，自动上报数据：

```
<script>
    uis.start({
      trackerUrl: 'your server path',
      userId: '1511676',
      siteId: 'csj',
    });
  </script>
```

## API 文档


- `uis.trackJqueryAjax($)` : 监听jquery的ajax事件，参数为jquery对象。需要先引入jquery，才能调用此方法。
- `uis.log({ext1:'xxx',ext2:'xxx'})` : 用户自定义日志信息，开发者在需要记日志的地方调用此方法，参数只能是: ext1,ext2 ... ext5。
- `uis.track(name, value)`
- `uis.setOption(name, value)`
- `uis.getOption(name)`

start 初始化参数：

- `trackerUrl` : 后台监听url  
- `userId`: 用户id  
- `siteId`: 站点id

## 主动埋点使用

- 如需手动设置，可以这样：

```
<div id="app" style="background:#ccc;"> 点我发送 </div>

<script src="http://design.yonyoucloud.com/static/jquery/3.2.1/jquery.js"></script>
<script type="text/javascript" src="./iuap-insight.js"></script>

<script>
  uis.start({
    trackerUrl: 'xxx',
    userId:'1511676',
    siteId:'csj',
  });

  $('#app').click(function(e){
    uis.track(e, 'click_text', '设置的信息')
  })
</script>
```

