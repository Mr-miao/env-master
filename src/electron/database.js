const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '/env_master_db.db');
let db;

/**
 * 关闭数据库
 */
function databaseClose() {
    db.close();
}

/**
 * 检查数据库是否已经创建，如果未创建则创建数据库
 */
function databaseOpen(){
    db = new sqlite3.Database(dbPath);

    try{
        if(!fs.existsSync(dbPath)){

            let sql = 'PRAGMA foreign_keys = false;\n' +
                'CREATE TABLE "strategies" ("ID" TEXT,"StartegiesName" TEXT,"State" TEXT,"Description" TEXT,PRIMARY KEY ("ID"));\n' +
                'CREATE TABLE "strategy_details" ("ID" TEXT,"StrategyID" TEXT NOT NULL,"AssociatedEnvironment" TEXT NOT NULL,"EnvironmentType" TEXT NOT NULL,"ExecutablePath" TEXT NOT NULL,"EnvironmentExecDetial" TEXT NOT NULL,PRIMARY KEY ("ID"),FOREIGN KEY ("StrategyID") REFERENCES "strategies" ("ID") ON DELETE NO ACTION ON UPDATE NO ACTION);\n' +
                'PRAGMA foreign_keys = true;';

            db.exec(sql);


        }
    }catch (err){
        console.error('init database error:', err.message);
    }

}


/**
 * 执行SQL操作语句
 * @param sqlArr sql语句数组
 * @param callback
 */
function updateData(sqlArr, callback) {

    let res ={'ret':0, 'data':''};
    try{

        for (const sql of sqlArr){
            let statement = db.prepare(sql);
            statement.run();
            statement.finalize();
        }

        callback(res);
    }catch (err){
        res.ret = -1;
        res.data = err.message;
    }

}

/**
 * 数据库查询
 * @param sql
 * @param callback
 */
function queryData(sql, callback) {
    let res ={'ret':0, 'data':''};
    console.log(sql);
    db.all(sql, function(err, rows) {
        console.log(rows);
        if(err){
            res.ret = -1;
            res.data = err.message;
        }else if(rows == undefined){
            res.ret = 0;
            res.data = [];
        }else {
            res.ret = 0;
            res.data = rows;
        }
        callback(res)
    });
}

module.exports = {
    updateData,
    queryData,
    databaseOpen,
    databaseClose
};
