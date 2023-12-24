const scanTool = require("@/electron/tools/scan");

/**
 * 扫描可执行文件关联的环境信息
 * @param scanPath
 * @param webContents
 */
const scan = (scanPath, onScanning, onScanComplete) =>{
    scanTool.scanFolder(scanPath, onScanning, onScanComplete);
}


module.exports = {
    scan
};