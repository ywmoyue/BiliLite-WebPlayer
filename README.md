# bililite-webplayer

- [biliuwp-lite](https://github.com/ywmoyue/biliuwp-lite) 使用的Web播放器前端项目
- 本项目不含获取播放地址的功能，无法脱离`biliuwp-lite`单独使用

## 安装依赖

```
pnpm install
```

## 开发
1. 设置hosts，注意该Host将影响网页版Bilibili正常使用，开发完成后请取消该Host
```
127.0.0.1 www.bilibili.com
```
2. 运行命令启动开发服务器
```
npm run dev
```
3. 打开`biliuwp-lite`，找到设置项：设置页->播放->展开优先播放器类型->Web播放器设置->启用开发模式
4. 打开任意视频即可

## 编译

1. 运行命令进行编译
```
npm run build
```
2. 使用编译产物`dist/index.html`替换`https://github.com/ywmoyue/biliuwp-lite/blob/dev/src/BiliLite.UWP/Assets/ShakaPlayer/index.html`