const envtools = require('envtools');
const dbTool = require("@/electron/database");

/**
 * 启动
 * @param record
 */
async function startup(record) {
    let result = {
        retCode : 0,
        data : ''
    };

    let ret;
    let items = record.innerData;

    for (let i = 0; i < items.length; i++) {
        switch (items[i].type) {
            case 'service' :
                ret = envtools.startService(items[i].env);
                if(ret.retCode != 0){
                    result.retCode = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
            case 'task' :
                ret = envtools.enableTaskInfo(items[i].env, false);
                if(ret.retCode != 0){
                    result.retCode = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
            case 'startup' :
                ret = envtools.setStartup(items[i].env, items[i].path, false);
                if(ret.retCode != 0){
                    result.retCode = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
        }
    }

    let sqls = [];

    if(result.retCode == 0){
        sqls.push("UPDATE strategies SET State = 'up' WHERE ID ='" + record.key + "'");
    }else {
        sqls.push("UPDATE strategies SET State = 'fault' WHERE ID ='" + record.key + "'");
    }
    console.log("1")

    await dbTool.updateData(sqls);
    console.log("2")
    return result;
}

/**
 * 关闭
 * @param record
 */
function shutdown(record) {
    let result = {
        retCode : 0,
        data : ''
    };

    let ret;

    let items = record.innerData;

    for (let i = 0; i < items.length; i++) {
        switch (items[i].type) {
            case 'service' :
                ret = envtools.stopService(items[i].env);
                if(ret.retCode != 0){
                    result.retCode = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
            case 'task' :
                ret = envtools.enableTaskInfo(items[i].env, true);
                if(ret.retCode != 0){
                    result.retCode = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
            case 'startup' :
                ret = envtools.setStartup(items[i].env, items[i].path, true);
                if(ret.retCode != 0){
                    result.retCode = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
        }
    }

    let sqls = [];

    if(result.retCode == 0){
        sqls.push("UPDATE strategies SET State = 'down' WHERE ID ='" + record.key + "'");
    }else {
        sqls.push("UPDATE strategies SET State = 'fault' WHERE ID ='" + record.key + "'");
    }

    dbTool.updateData(sqls);

    return result;
}

module.exports = {
    startup,
    shutdown
};