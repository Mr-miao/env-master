const spawn = require('cross-spawn');


const exec = (script, callback) => {
    // 使用 cross-spawn
    console.log('待执行脚本：'+script)
    let child = spawn('cmd', ['/c', script], { stdio: 'pipe',env: { NODE_ENV: 'utf-8' } });

    let scriptOutput = ''; // 用于存储脚本输出
    let scriptExecErr = ''; // 用于存储脚本执行时的错误

    let ret = {
        ret:0,
        data:''
    }

    child.stdout.on('data', (data) => {
        scriptOutput += data.toString();
    });

    child.stderr.on('data', (data) => {
        // 处理错误输出
        console.error(data.toString());
        scriptExecErr += data.toString();
    });

    child.on('close', (code) => {
        ret.ret = code;


        if (code !== 0) {
            console.error('执行出错');
            ret.data = scriptExecErr;
        } else {
            console.log('执行成功');
            console.log('脚本输出:\n', scriptOutput); // 输出脚本的控制台输出
            ret.data = scriptOutput;
        }

        callback(ret);
    });
}

module.exports = {
    exec
};

