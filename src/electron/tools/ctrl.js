const envtools = require('envtools');

/**
 * 启动
 * @param record
 * @param callback
 */
function startup(record, callback) {
    let result = {
        ret : 0,
        data : ''
    };

    let ret;
    let items = record.strategyDetails;

    for (let i = 0; i < items.length; i++) {
        switch (items[i].type) {
            case 'service' :
                ret = envtools.startService(items[i].env);
                if(ret.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '\n'
                }
                break;
            case 'task' :
                ret = envtools.enableTaskInfo(items[i].env, false);
                if(ret.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '\n'
                }
                break;
            case 'startup' :
                ret = envtools.setStartup(items[i].env, items[i].path, false);
                if(ret.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '\n'
                }
                break;
        }
    }

    callback(result);

}

/**
 * 关闭
 * @param record
 * @param callback
 */
function shutdown(record, callback) {
    let result = {
        ret : 0,
        data : ''
    };

    let ret;

    let items = record.strategyDetails;

    for (let i = 0; i < items.length; i++) {
        switch (items[i].type) {
            case 'service' :
                ret = envtools.stopService(items[i].env);
                if(ret.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
            case 'task' :
                ret = envtools.enableTaskInfo(items[i].env, true);
                if(ret.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
            case 'startup' :
                ret = envtools.setStartup(items[i].env, items[i].path, true);
                if(ret.retCode != 0){
                    result.ret = -1;
                    result.data += items[i].env + '操作未成功，因为：' + ret.data + '</br>'
                }
                break;
        }
    }

    callback(result);
}

/**
 * 获取状态
 * @param record
 * @returns {{data: string, retCode: number}}
 */
function getStat(record) {
    let result = {
        ret : 0,
        data : ''
    };

    let ret;

    switch (record.type) {
        case 'service' :
            ret = envtools.getServiceStatus(record.env);
            if(ret.retCode < 0){
                result.ret = -1;
                result.data += record.env + '操作未成功，因为：' + ret.data + '</br>'
            }else {
                result.ret = ret.retCode;
                result.data = ret.data;
            }
            break;
        case 'task' :
            ret = envtools.getTaskStatus(record.env);
            if(ret.retCode < 1){
                result.ret = -1;
                result.data += record.env + '操作未成功，因为：' + ret.data + '</br>'
            }else {
                result.ret = ret.retCode;
                result.data = ret.data;
            }
            break;
        case 'startup' :
            ret = envtools.startupStatus(record.env);
            if(ret.retCode < 1){
                result.ret = -1;
                result.data += record.env + '操作未成功，因为：' + ret.data + '</br>'
            }else {
                result.ret = ret.retCode;
                result.data = ret.data;
            }
            break;
    }

    return result;

}

module.exports = {
    startup,
    shutdown,
    getStat
};