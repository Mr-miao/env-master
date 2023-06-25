const fs = require('fs-extra');
const path = require('path');
const envtools = require('./envtools.js');

/**
 * 文件夹遍历扫描方法
 * @param folderPath 待扫描文件夹路径
 * @param webContents 接收扫描结果的渲染进程
 * @returns {Promise<*[]>}
 */
async function scanFolder(folderPath, webContents) {
    //
    let files;
    let filePath;

    files = await fs.readdir(folderPath, {encoding:'ascii'});

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
                    // console.log(filePath);
                    let serviceInfo = envtools.findService(filePath);
                    serviceInfo = JSON.parse(serviceInfo);
                    console.log(filePath);
                    if (serviceInfo.retCode == 0 && serviceInfo.data.length > 0){
                        console.log(serviceInfo);
                        let retJson = {"name":path.basename(filePath),
                            "path":filePath,
                            "type":ext,
                            children:[{
                                "name":serviceInfo.data[0].name,
                                "path":"",
                                "type":"service"
                            }]}
                        //将扫描结果送给页面
                        webContents.send('scanResult', retJson);
                    }
                    // console.log(serviceInfo);
                }
            } else if (stats.isDirectory()) {
                let subFiles = await fs.readdir(filePath);
                for(const subFile of subFiles){
                    let subFilePath = path.join(filePath.replace(folderPath, ''), subFile);
                    // console.log(subFilePath);
                    files.push(subFilePath);
                }
                // console.log(subFiles);
            }
        }catch (err){
            console.error('Error while scanning folder:', err);
        }
    }

}

module.exports = {
    scanFolder,
};
