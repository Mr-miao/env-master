//注册扫描文件的信息监听事件
const scanTool = require("@/electron/scan");
const dbTool = require("@/electron/database");
const ctrl = require("@/electron/ctrl");

/**
 * 数据相关的环境初始化
 */
function databaseSetup(){
    dbTool.databaseOpen();
}

function databaseClose(){
    dbTool.databaseClose();
}

/**
 * 主线程消息监听事件初始化方法
 * @param ipcMain
 * @param win 创建UI窗口
 */
function ipcSetup(ipcMain, win){
    ipcMain.on('scan', (event, args) => {
        scanTool.scanFolder(args, win.webContents);
    });

    //注册数据库操作的监听事件
    ipcMain.on('dbupdate', (event, args) => {
        dbTool.updateData(args, function (res) {
            // console.log(res);
            win.webContents.send('onDBExecComplete', res);
        });
    });

    //注册数据库查询的监听事件
    ipcMain.on('dbquery', (event, args) => {
        dbTool.queryData(args,function (res) {
            win.webContents.send('onDBExecComplete', res);
        });
    });

    //窗口最小化
    ipcMain.on('minimizeWin', () => {
        win.minimize();
    });

    //窗口最大化
    ipcMain.on('maximizeWin', () => {
        if(win.isMaximized()){ // 判断 窗口是否已最大化
            win.restore();// 恢复原窗口大小
        }else{
            win.maximize();  //最大化窗口
        }
    });

    //窗口关闭
    ipcMain.on('closeWin', () => {
        win.close();
    });

    //启用环境
    ipcMain.on('envStartup', (event, args) => {
        let record = JSON.parse(args);
        ctrl.startup(record).then((res) => {
            console.log("3")
            win.webContents.send('envOptComplete', res);
        })
    });

    //终止环境
    ipcMain.on('envShutdown', (event, args) =>{
        let record = JSON.parse(args);
        let ret = ctrl.shutdown(record);
        win.webContents.send('envOptComplete', ret);
    });
}

module.exports = {
    ipcSetup,
    databaseSetup,
    databaseClose
};