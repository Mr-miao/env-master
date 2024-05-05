# EnvMaster

EnvMaster is a desktop application based on vue3+electron, used to manage switching development environments. In daily development, different projects require different development and testing environments. If all environments are started when the computer boots up, it will consume a lot of resources and also be inconvenient to manage. EnvMaster solves this problem by allowing users to start specific environments and manage switching between them.

EnvMaster is built on Vue CLI Plugin Electron Builder. The project is divided into the application layer and the tool layer, with the application layer developed using vue3+electron and the tool layer developed using C++.

EnvMaster features the following functionalities:
1. Scan executable programs corresponding to startup items, services, and scheduled tasks in a specified directory.
2. Customize startup items, services, and scheduled tasks according to development needs, enabling one-click start and stop.
3. Support pre-start and post-start scripts for each executable program's environment.

## How to Use
Enter the directory of the environments you want to control in the interface below, click "Scan", and the application will automatically find startup items, Windows services, scheduled tasks, etc., corresponding to bat, exe, and .service files. Then click "New Policy" to save these environments that need to be controlled.

![image](https://github.com/Mr-miao/env-master/assets/20635826/fbed3ef4-d753-46b2-a138-d4f648f7a725)
![image](https://github.com/Mr-miao/env-master/assets/20635826/8e55c26e-2315-47b5-862f-15088c387a15)
![image](https://github.com/Mr-miao/env-master/assets/20635826/3c42a445-5a45-4cd1-a23d-d0b4e80d44e6)

After completing the above steps, you can enter the control panel to start/stop and customize environments.
![image](https://github.com/Mr-miao/env-master/assets/20635826/814acd72-7795-4830-a6b8-24fb06564ef7)
Clicking on the code icon after each executable program allows you to write related environment pre-start and post-start scripts according to actual needs. For example, you can write a bat script to wait for the Docker server to start.
![image](https://github.com/Mr-miao/env-master/assets/20635826/f132db3c-df3a-42e5-82f1-00794beda80f)

Below is an example (for managing the environment of a Docker-based Java development project):

The environment includes starting Mysql, Docker, Redis, and IDEA.
![image](https://github.com/Mr-miao/env-master/assets/20635826/0a84f2be-c54d-4e47-98f0-28d4240b02dd)

In the associated environment of Docker, a post-start execution script is used to check if Docker has started successfully. If successful, Redis is started.
![image](https://github.com/Mr-miao/env-master/assets/20635826/fabd060a-0155-4066-892c-92ad5409178a)

## Local Debugging
First, you need to install Node.js (version 16.20.0) and Yarn, then execute the following command to install dependencies:
```
yarn config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
yarn install
```
Please note that installing evntool requires using the `yarn add file:path` command (or directly referencing the GitHub repository URL), where `path` should point to the evntool source code directory, which should include package.json and index.js, for example:
```
yarn add file:E:\work\git_repo\env-tools\
```
### Other
I am not a professional Electron developer, so there may be bugs or unreasonable code structures in the project. If you have any questions or suggestions, feel free to contact me. Thank you!
