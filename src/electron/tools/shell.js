const fs = require('fs');
const path = require('path');
const os = require('os');
const spawn = require('cross-spawn');
const log = require('@/electron/tools/log');


const exec = async (script) => {
    // 使用 cross-spawn
    log.info('待执行脚本：'+ script)

    let ret = {
        retCode:0,
        data:''
    }

    if(script == undefined || script == ''){
        return ret;
    }

    // 生成一个唯一的临时文件名
    const tempFileName = `temp_${Date.now()}.bat`;

    // 获取系统临时文件夹路径
    const tempDir = os.tmpdir();

    // 构造临时文件的完整路径
    const tempFilePath = path.join(tempDir, tempFileName);

    // 将字符串写入临时文件
    fs.writeFile(tempFilePath, script, (err) => {
        if (err) {
            log.error('写入文件时出错:', err);
            return;
        }
        log.info(`字符串已成功写入临时文件: ${tempFilePath}`);
    });

    let child = spawn('powershell', ['/c', tempFilePath]);

    let scriptOutput = ''; // 用于存储脚本输出
    let scriptExecErr = ''; // 用于存储脚本执行时的错误



    child.stdout.on('data', (data) => {
        scriptOutput += data.toString();
    });

    child.stderr.on('data', (data) => {
        // 处理错误输出
        log.error(data.toString());
        scriptExecErr += data.toString();
    });


    const closeResult = await new Promise((resolve) => {
        child.on('close', (code) => {
            if (code !== 0) {
                log.error('执行出错:' + scriptExecErr);
                ret.retCode = -1;
                ret.data = scriptExecErr;
            } else {
                log.info('执行成功');
                log.info('脚本输出:\n', scriptOutput);
                ret.retCode = 0;
                ret.data = scriptOutput;
            }

            resolve();
        });
    });

    await closeResult;
    return ret;
}

module.exports = {
    exec
};

