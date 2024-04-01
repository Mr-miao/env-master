const spawn = require('cross-spawn');


const exec = async (script) => {
    // 使用 cross-spawn
    console.log('待执行脚本：'+script)

    let ret = {
        retCode:0,
        data:''
    }

    if(script == undefined || script == ''){
        return ret;
    }

    let child = spawn('cmd', ['/c', script], { encoding: 'utf8' });

    let scriptOutput = ''; // 用于存储脚本输出
    let scriptExecErr = ''; // 用于存储脚本执行时的错误



    child.stdout.on('data', (data) => {
        scriptOutput += data.toString();
    });

    child.stderr.on('data', (data) => {
        // 处理错误输出
        console.error(data.toString());
        scriptExecErr += data.toString();
    });


    const closeResult = await new Promise((resolve) => {
        child.on('close', (code) => {
            if (code !== 0) {
                console.error('执行出错');
                ret.retCode = -1;
                ret.data = scriptExecErr;
            } else {
                console.log('执行成功');
                console.log('脚本输出:\n', scriptOutput);
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

