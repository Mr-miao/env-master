# EnvMaster

## 介绍
EnvMaster是一个基于vue3+electron的桌面应用，用于管理开发环境的切换。
在日常开发中，不同的项目所需的开发环境和测试环境是不一样的，如果所有的环境在计算机开机时都启动，那么会非常耗费资源，而且也不方便管理。
EnvMaster可以解决这个问题，它允许用户启动指定的环境，并且可以管理环境之间的切换。

本项目基于Vue CLI Plugin Electron Builder构建

## 本地调试
整个项目分为应用层和C++工具层，应用层使用vue3+electron开发，工具层使用C++开发。因此本地开发需要
首先需要安装node（node 版本为16.20.0）和yarn，然后执行以下命令安装依赖
```
yarn config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
yarn install
```
需要注意evntool的安装需要使用yarn add file:path指令安装，其中path需要指向evntool源码目录，目录中要包含package.json、index.js，例如：
```
yarn add file:E:\work\git_repo\env-tools\
```
