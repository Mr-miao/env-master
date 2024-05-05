const shell = require("@/electron/tools/shell")
const envtools = require('envtools');
const scriptHandler = require("@/electron/handlers/db/scriptHandler");
const enums = require("@/comm/enum");

const startup = async (env)=>{
    let record = JSON.parse(env);

    let items = record.strategyDetails;
    let actionRet;
    let startupScript = undefined;
    let execRet;
    let result = {
        ret : 0,
        data : ''
    };

    for (let i = 0; i < items.length; i++) {
        let res = await scriptHandler.getScriptByStrategyDetailsIDAsync(items[i].key)
        if (res.ret == 0){
            for (const script of res.data) {

                if(script.type == enums.StrategyScriptType.WITH_STARTUP){
                    startupScript = script.script;
                }
            }

            if(startupScript != undefined && startupScript.priorExec){
                execRet = await shell.exec(startupScript);
                if(execRet.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '执行启动脚本未成功，因为：' + execRet.data + '\n';
                    return result;
                }
            }

            switch (items[i].type) {
                case 'service' :
                    actionRet = envtools.startService(items[i].env);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '\n'
                    }
                    break;
                case 'task' :
                    actionRet = envtools.enableTaskInfo(items[i].env, false);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '\n'
                    }
                    break;
                case 'startup' :
                    actionRet = envtools.setStartup(items[i].env, items[i].path, false);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '\n'
                    }
                    break;
                case 'exec' :
                    actionRet = envtools.startExec(items[i].path.replace(/\\/g, "/"));
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '\n'
                    }
                    break;
            }

            if(startupScript != undefined && !startupScript.priorExec){
                execRet = await shell.exec(startupScript);
                if(execRet.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '执行启动脚本未成功，因为：' + execRet.data + '\n';
                    return result;
                }
            }
        }else {
            return res;
        }

    }

    return result;


}

const shutdown = async (env)=>{
    let record = JSON.parse(env);

    let items = record.strategyDetails;
    let actionRet;
    let shutdownScript = undefined;
    let execRet
    let result = {
        ret : 0,
        data : ''
    };

    for (let i = 0; i < items.length; i++) {
        let res = await scriptHandler.getScriptByStrategyDetailsIDAsync(items[i].key);

        if (res.ret == 0){
            for (const script of res.data) {
                if(script.type == enums.StrategyScriptType.WITH_SHUTDOWN){
                    shutdownScript = script.script;
                }
            }

            if(shutdownScript != undefined && shutdownScript.priorExec){
                execRet = await shell.exec(shutdownScript);
                if(execRet.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + execRet.data + '\n';
                    return result;
                }
            }

            switch (items[i].type) {
                case 'service' :
                    actionRet = envtools.stopService(items[i].env);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '</br>'
                    }
                    break;
                case 'task' :
                    actionRet = envtools.enableTaskInfo(items[i].env, true);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '</br>'
                    }
                    break;
                case 'startup' :
                    actionRet = envtools.setStartup(items[i].env, items[i].path, true);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '</br>'
                    }
                    break;
                case 'exec' :
                    actionRet = envtools.closeExec(items[i].env);
                    if(actionRet.retCode != 0){
                        result.ret = -1;
                        result.data += items[i].env + '操作未成功，因为：' + actionRet.data + '</br>'
                    }
                    break;
            }

            if(shutdownScript != undefined && !shutdownScript.priorExec){
                execRet = await shell.exec(shutdownScript);
                if(execRet.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + execRet.data + '\n';
                    return result;
                }
            }
        }else {
            return res;
        }
    }

    return result;


}

module.exports = {
    startup,
    shutdown
};