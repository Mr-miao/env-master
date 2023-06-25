const os = require('os');

const envtools = require('envtools');
// console.log(os.platform());

const WIN_32 = 'win32';

/**
 * 查找一个EXE文件或BAT文件是否有创建系统服务
 * @param execName 可执行文件的名称
 */
function findService(execName){
    let result;
    //根据操作系统判断使用什么库
    if(os.platform() === WIN_32){
        result = envtools.getServiceInfo(execName);
    }else {
        result = {};
    }
    return JSON.stringify(result);
}

module.exports = {
    findService,
};