const scanTool = require("@/electron/tools/scan");

/**
 * 扫描指定文件夹可执行文件关联的环境信息
 * @param scanPath
 * @param webContents
 */
const scan = (scanPath, onScanning, onScanComplete) =>{
    scanTool.scanFolder(scanPath, onScanning, onScanComplete);
}

/**
 * 扫描可执行文件关联的环境信息
 * @param scanFile
 * @returns {{ret: number, data: *[]}|{ret: number, data: string}}
 */
const scanFile = (scanFile) =>{
    return scanTool.scanFile(scanFile);
}


module.exports = {
    scan,
    scanFile
};