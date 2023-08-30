//注册扫描文件的信息监听事件
const scanTool = require("@/electron/scan");
const dbTool = require("@/electron/database");

/**
 * 数据相关的环境初始化
 */
function dataSetup(){
    dbTool.databaseInit();
}

/**
 * 主线程消息监听事件初始化方法
 * @param ipcMain
 * @param win 创建UI窗口
 */
function ipcSetup(ipcMain, win){
    ipcMain.on('scan', (event, args) => {
        scanTool.scanFolder(args, win);
    });

    //注册数据库操作的监听事件
    ipcMain.on('dbupdate', (event, args) => {
        dbTool.updateData(args).then(function (res) {
            console.log(res);
            win.send('onDBExecComplete', res);
        });
    });

    //注册数据库查询的监听事件
    ipcMain.on('dbquery', (event, args) => {
        dbTool.queryData(args).then(function (res) {
            win.send('onDBExecComplete', res);
        });
    });
}

module.exports = {
    ipcSetup,
    dataSetup
};