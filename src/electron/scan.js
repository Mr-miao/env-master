const fs = require('fs-extra');
const path = require('path');
const envtools = require('envtools');
const until = require('@/comm/until')

//禁用node对Asar文档的支持，这样可以确保扫描文件过程中遇到asar文档时不报错
process.noAsar = true;

/**
 * 文件夹遍历扫描方法
 * @param folderPath 待扫描文件夹路径
 * @param webContents 接收扫描结果的渲染进程
 * @returns {Promise<*[]>}
 */
async function scanFolder(folderPath, webContents) {
    //扫描所得的文件数组
    let files;
    //从单个文件上获取到的文件路径
    let filePath;

    files = await fs.readdir(folderPath, {encoding:'utf-8'});

    while(files.length > 0){
        try{
            // console.log(files)
            let file = files.pop();
            filePath = path.join(folderPath, file);
            let stats = await fs.stat(filePath);

            if (stats.isFile()) {

                // 判断文件扩展名是否为 .exe 或 .bat
                const ext = path.extname(filePath);

                if (ext === '.exe' || ext === '.bat') {
                    // 查找服务
                    let serviceInfo = envtools.getServiceInfo(filePath);
                    // 查找查找启动项
                    let startupInfo = envtools.getStartupInfo(filePath);
                    // 查找查找计划任务
                    let taskInfo = envtools.getTaskInfo(filePath);

                    // serviceInfo = JSON.parse(serviceInfo);
                    // startupInfo = JSON.parse(startupInfo);
                    let findedArr = [];

                    // 拼接服务返回结果
                    if (serviceInfo.retCode == 0){
                        console.log(filePath);
                        for (let i = 0; i < serviceInfo.data.length; i++ ){
                            findedArr.push({
                                'key':until.getUUID(),
                                'exec':path.basename(filePath),
                                'path':filePath,
                                'env':serviceInfo.data[i].name,
                                'comment':serviceInfo.data[i].dispalyName,
                                'type':'service'
                            });
                        }

                    }else if(startupInfo.retCode != -2){
                        console.error('Error while scanning folder:', serviceInfo.data);
                    }

                    // 拼接启动项返回结果
                    if(startupInfo.retCode == 0){

                        for (let i = 0; i < startupInfo.data.length; i++ ){
                            findedArr.push({
                                'key':until.getUUID(),
                                'exec':path.basename(filePath),
                                'path':filePath,
                                "env":startupInfo.data[i].name,
                                "comment":startupInfo.data[i].path,
                                "type":"startup"
                            });
                        }
                    }else if(startupInfo.retCode != -2){
                        console.error('Error while scanning folder:', startupInfo.data);
                    }

                    // 拼接计划任务返回结果
                    if(taskInfo.retCode == 0){

                        for (let i = 0; i < taskInfo.data.length; i++ ){
                            findedArr.push({
                                'key':until.getUUID(),
                                'exec':path.basename(filePath),
                                'path':filePath,
                                "env":taskInfo.data[i].name,
                                "comment":taskInfo.data[i].details,
                                "type":"task"
                            });
                        }
                    }else if(startupInfo.retCode != -2){
                        console.error('Error while scanning folder:', taskInfo.data);
                    }


                    //如果找到对应可执行程序的service、计划任务、自启动项才往页面发消息
                    if(findedArr.length > 0){
                        //将扫描结果送给页面
                        webContents.send('scanResult', findedArr);
                    }

                    // console.log(serviceInfo);
                }
            } else if (stats.isDirectory()) {
                let subFiles = await fs.readdir(filePath);
                for(const subFile of subFiles){
                    let subFilePath = path.join(filePath.replace(folderPath, ''), subFile);
                    files.push(subFilePath);
                }
            }
        }catch (err){
            console.error('Error while scanning folder(' + filePath + '):', err);
        }
    }

    //通知页面扫描已经完成
    webContents.send('scanComplete');

}

module.exports = {
    scanFolder,
};
