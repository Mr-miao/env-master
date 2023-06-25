# env-master

## 遗留问题
1. 安装自定义插件evntool时nodemodule里总是没有编译结果

## Project setup
```
yarn config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
yarn install
```
需要注意evntool的安装需要使用yarn add file:path指令安装，其中path需要指向evntool编译成功的目录，目录中要包含package.json、index.js
### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
