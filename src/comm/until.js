const uuid = require("uuid");

function getUUID(){
    return  uuid.v4().replaceAll(/-/g, '');
}

function getFileNameByPath(filePath){
    if(filePath == undefined || filePath == ''){
        return '';
    }

    // 使用正则表达式匹配不同操作系统的路径分隔符
    let regex = /[\\/]/;
    let pathParts = filePath.split(regex);

    // 获取路径中的最后一个部分作为文件名
    let fileName = pathParts[pathParts.length - 1];

    return fileName;
}

/**
 * 进程锁对象
 * @type {{sleep: (function(*): Promise<unknown>), stop: locker.stop, start: locker.start, lock: boolean}}
 */
const locker = {
    sleep:(ms) => {return new Promise(resolve => setTimeout(resolve, ms));},
    lock:true,
    wait:() => {
        console.log("lock：" + locker.lock)
        while (locker.lock){
            console.log("i am waitting")
            locker.sleep(1000);
        }
    },
    release:() => {
        locker.lock = false;
    }

}

module.exports = {
    getUUID,
    getFileNameByPath,
    locker
};