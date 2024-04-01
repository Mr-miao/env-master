//注册扫描文件的信息监听事件
// const scanTool = require("@/electron/tools/scan");
const dbTool = require("@/electron/tools/database");
const listenerEnums = require("@/electron/handlers/enum");
const scanHandler = require("@/electron/handlers/scanner/scanHandler");
const ctrlHandler = require("@/electron/handlers/control/ctrlHandler");
const strategyHandler = require("@/electron/handlers/db/strategyHandler");
const scriptHandler = require("@/electron/handlers/db/scriptHandler");



/**
 * 数据相关的环境初始化
 */
function databaseSetup(){
    dbTool.databaseSetup();
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
    ipcMain.on(listenerEnums.MSG_SCAN_PATH, (event, scanPath) => {
        scanHandler.scan(scanPath,
            (finded) => {
            win.webContents.send(listenerEnums.MSG_SCAN_FINDED, finded);
        }, () =>{
            win.webContents.send(listenerEnums.MSG_SCAN_COMPLETE);
        });
    });

    ipcMain.on(listenerEnums.MSG_SCAN_FILE, (event, scanPath) => {
        let ret = scanHandler.scanFile(scanPath);
        win.webContents.send(listenerEnums.MSG_SCAN_FILE, ret);
    });

    ipcMain.on(listenerEnums.MSG_SAVE_STRATEGY, (event, strategy) => {
        strategyHandler.saveStrategy(strategy, (res)=>{
            win.webContents.send(listenerEnums.MSG_SAVE_STRATEGY, res);
        });
    });

    ipcMain.on(listenerEnums.MSG_GET_STRATEGY, (event, strategy) => {
        strategyHandler.getStrategy(strategy, (res)=>{
            win.webContents.send(listenerEnums.MSG_GET_STRATEGY, res);
        });
    });

    ipcMain.on(listenerEnums.MSG_DEL_STRATEGY, (event, strategy) => {
        strategyHandler.deleteStrategy(strategy, (res)=>{
            win.webContents.send(listenerEnums.MSG_DEL_STRATEGY, res);
        });
    });


    //注册策略管理界面刷新事件
    ipcMain.on(listenerEnums.MSG_GET_ALL_STRATEGY_BY_STAT, () => {
        strategyHandler.getAllStrategyByStat((ret)=>{
            win.webContents.send(listenerEnums.MSG_GET_ALL_STRATEGY_BY_STAT, ret);
        })

    });

    // // 监听保存策略详情的事件
    // ipcMain.on(listenerEnums.MSG_SAVE_STRATEGY_DETAIL, (event, strategyDetail) => {
    //     strategyHandler.saveStrategyDetail(strategyDetail,(ret)=>{
    //         win.webContents.send(listenerEnums.MSG_SAVE_STRATEGY_DETAIL, ret);
    //     })
    //
    // });

    // 监听删除策略详情的事件
    ipcMain.on(listenerEnums.MSG_DEL_STRATEGY_DETAIL, (event, strategyDetailId) => {
        strategyHandler.deleteStrategyDetail(strategyDetailId,(ret)=>{
            win.webContents.send(listenerEnums.MSG_DEL_STRATEGY_DETAIL, ret);
        })
    });

    //移动策略详情执行顺序
    ipcMain.on(listenerEnums.MSG_MOVE_STRATEGY_DETAIL_INDEX, (event, param) => {
        strategyHandler.moveStrategyDetailIndex(param.strategyDetailId, param.moveType,(ret)=>{
            win.webContents.send(listenerEnums.MSG_MOVE_STRATEGY_DETAIL_INDEX, ret);
        })
    });

    ipcMain.on(listenerEnums.MSG_GET_SCRIPT_BY_STRATEGY, (event, id)=>{
        scriptHandler.getScriptByStrategyDetailsID(id, (res)=>{
            win.webContents.send(listenerEnums.MSG_GET_SCRIPT_BY_STRATEGY, res);
        });
    })

    //保存脚本
    ipcMain.on(listenerEnums.MSG_SVAE_SCRIPT, (event, scripts)=>{
        scriptHandler.saveScript(scripts, (res)=>{
            win.webContents.send(listenerEnums.MSG_SVAE_SCRIPT, res);
        });
    })

    //窗口最小化
    ipcMain.on(listenerEnums.MSG_MINIMIZE_WIN, () => {
        win.minimize();
    });

    //窗口最大化
    ipcMain.on(listenerEnums.MSG_MAXIMIZE_WIN, () => {
        if(win.isMaximized()){ // 判断 窗口是否已最大化
            win.restore();// 恢复原窗口大小
        }else{
            win.maximize();  //最大化窗口
        }
    });

    //窗口关闭
    ipcMain.on(listenerEnums.MSG_CLOSE_WIN, () => {
        win.close();
    });

    //启用环境
    ipcMain.on(listenerEnums.MSG_ENV_STARTUP, (event, args) => {
        ctrlHandler.startup(args).then(res =>{
            win.webContents.send(listenerEnums.MSG_ENV_STARTUP, res);
        })
    });

    //终止环境
    ipcMain.on(listenerEnums.MSG_ENV_SHUTDOWN, (event, args) =>{
        ctrlHandler.shutdown(args).then((res)=>{
            win.webContents.send(listenerEnums.MSG_ENV_SHUTDOWN, res);
        });
    });
}

module.exports = {
    ipcSetup,
    databaseSetup,
    databaseClose
};