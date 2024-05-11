'use strict'

import { app, BrowserWindow, ipcMain, Menu, Tray} from 'electron'
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from "path";

//此部分是自己的库
const handler = require("@/electron/handlers/listener");
const listenerEnums = require("@/electron/handlers/enum");

const isDevelopment = process.env.NODE_ENV !== 'production'

const gotTheLock = app.requestSingleInstanceLock();

// Scheme must be registered before the app is ready
// protocol.registerSchemesAsPrivileged([
//   { scheme: 'app', privileges: { secure: true, standard: true } }
// ])

let win = null;
process.on('unhandledRejection', e => { console.error(e); });

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
  app.on('ready', async () => {

    createWindow();
  })

// Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit') {
          handler.databaseClose();
          app.quit();
        }
      })
    } else {
      process.on('SIGTERM', () => {
        handler.databaseClose();
        app.quit()
      })
    }
  }

}



async function createWindow() {
  let mainPageURL;

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainPageURL = process.env.WEBPACK_DEV_SERVER_URL;
  } else {
    mainPageURL = path.join(__dirname, "index.html");
  }

  win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    icon: path.join(__static, "./app-icon.png"),
    webPreferences: {
      sandbox: false,
      preload: path.resolve(__dirname, './preload.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      // enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      // webSecurity: false
    }
  });

  win.setTitle('EnvMaster');

  // let devtools = new BrowserWindow();


  if(process.platform === 'win32'){
    //设置托盘图标和菜单
    let trayMenuTemplate = [{
        label: '打开',
        click: () => {
          win.webContents.send(listenerEnums.MSG_WIN_STAT_CHANGE, false)
          win.show();
        }
      }, {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    ];
    //系统托盘图标
    let appTray = new Tray(path.join(__static, "./app-icon.png"));
    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    //设置此托盘图标的悬停提示内容
    appTray.setToolTip('EnvMaster');
    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);
    //单击右下角小图标显示应用左键
    appTray.on('double-click',function(){
      win.webContents.send(listenerEnums.MSG_WIN_STAT_CHANGE, false)
      win.show();
    })
    //右键
    appTray.on('right-click', () => {
      appTray.popUpContextMenu(trayMenuTemplate);
    });
  };

  win.on('maximize', () => {
    win.webContents.send(listenerEnums.MSG_WIN_STAT_CHANGE, true)
  });

  win.on('unmaximize', () => {
    win.webContents.send(listenerEnums.MSG_WIN_STAT_CHANGE, false)
  });

  handler.databaseSetup();
  handler.ipcSetup(ipcMain,win);

  await win.loadURL(mainPageURL);
}


