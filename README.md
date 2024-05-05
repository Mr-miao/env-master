# EnvMaster

[中文](https://github.com/Mr-miao/env-master/blob/master/README.md)|[English](https://github.com/Mr-miao/env-master/blob/master/README_EN.md)

EnvMaster是一个基于vue3+electron的桌面应用，用于管理开发环境的切换。
在日常开发中，不同的项目所需的开发环境和测试环境是不一样的，如果所有的环境在计算机开机时都启动，那么会非常耗费资源，而且也不方便管理。
EnvMaster可以解决这个问题，它允许用户启动指定的环境，并且可以管理环境之间的切换。

EnvMaster基于Vue CLI Plugin Electron Builder构建，整个项目分为应用层和工具层，应用层使用vue3+electron开发，工具层使用C++开发。

EnvMaster具备以下功能：
1. 扫描指定目录下可执行程序对应的开机启动项、service、计划任务
2. 根据自身开发需要进行开机启动项、service、计划任务的组合，实现一键启停
3. 支持针对每一个可执行程序对应的环境编制启动前脚本和启动后脚本


## 怎么使用
在下面的界面中使用输入需要控制的环境目录，点击扫描，应用会自动找到其中bat、exe、.serveice文件对应的启动项、windwos service、计划任务等。而后点击新建策略即可保存这些需要控制的环境

![image](https://github.com/Mr-miao/env-master/assets/20635826/fbed3ef4-d753-46b2-a138-d4f648f7a725)
![image](https://github.com/Mr-miao/env-master/assets/20635826/8e55c26e-2315-47b5-862f-15088c387a15)
![image](https://github.com/Mr-miao/env-master/assets/20635826/3c42a445-5a45-4cd1-a23d-d0b4e80d44e6)

完成以上操作后，可以进入控制面面板，进行环境的启停和定制
![image](https://github.com/Mr-miao/env-master/assets/20635826/814acd72-7795-4830-a6b8-24fb06564ef7)
点击每个可执行程序后的代码图标，可以根据实际需要编写其相关环境启动前和启动后的配合脚本，例如你可以写一个等待Docker服务器启动的bat脚本。
![image](https://github.com/Mr-miao/env-master/assets/20635826/f132db3c-df3a-42e5-82f1-00794beda80f)

以下是示例（用于管理一个基于Docker的java开发项目的环境）：

环境包含启动Mysql、启动Docker及Redis、启动IDEA
![image](https://github.com/Mr-miao/env-master/assets/20635826/0a84f2be-c54d-4e47-98f0-28d4240b02dd)

Docker的关联环境中使用了环境启动后的执行脚本用于检测docker是否启动成功，如果成功则启动Redis
![image](https://github.com/Mr-miao/env-master/assets/20635826/fabd060a-0155-4066-892c-92ad5409178a)



## 本地调试
首先需要安装node（node 版本为16.20.0）和yarn，然后执行以下命令安装依赖
```
yarn config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
yarn install
```
需要注意evntool的安装需要使用yarn add file:path指令安装（也可以直接引用github的仓库地址），其中path需要指向evntool源码目录，目录中要包含package.json、index.js，例如：
```
yarn add file:E:\work\git_repo\env-tools\
```
### 其他
本人并非专业的Electron开发工程师，因此在项目内可能存在bug或不合理的代码架构，如果您有问题或建议可以随时联系我谢谢！
