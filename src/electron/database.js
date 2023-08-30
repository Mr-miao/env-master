const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '/env_master_db.db');


let db;
/**
 * 检查数据库是否已经创建，如果未创建则创建数据库
 */
async function databaseInit(){
    try{
        if(!fs.existsSync(dbPath)){

            let sqls = new Array();
            sqls.push('PRAGMA foreign_keys = false;');
            sqls.push('CREATE TABLE "strategies" ("ID" TEXT,"StartegiesName" TEXT,"State" TEXT,"Description" TEXT,PRIMARY KEY ("ID"));');
            sqls.push('CREATE TABLE "strategy_details" ("ID" TEXT,"StrategyID" TEXT NOT NULL,"AssociatedEnvironment" TEXT NOT NULL,"EnvironmentType" TEXT NOT NULL,"ExecutablePath" TEXT NOT NULL,"EnvironmentExecDetial" TEXT NOT NULL,PRIMARY KEY ("ID"),FOREIGN KEY ("StrategyID") REFERENCES "strategies" ("ID") ON DELETE NO ACTION ON UPDATE NO ACTION);');
            sqls.push('PRAGMA foreign_keys = true;');

            await updateData(sqls);

        }
    }catch (err){
        console.error('init database error:', err.message);
    }

}


/**
 * 执行SQL操作语句
 * @param sqlArr sql语句数组
 * @returns {Promise<{ret: number, data: string}>}
 */
async function updateData(sqlArr) {

    let res ={'ret':0, 'data':''};
    try{
        db = new sqlite3.Database(dbPath);
        return await new Promise((resolve) =>{
            db.serialize(() => {
                for (let i = 0; i < sqlArr.length; i++) {
                    console.log(sqlArr[i])
                    db.run(sqlArr[i]);
                }

                res.ret = 0;
                res.data = 'success';
                resolve(res);
            });
        })

    }catch (err){
        res.ret = -1;
        res.data = err.message;
    }finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }

    return res;
}

/**
 * 数据库查询
 * @param sql
 * @returns {Promise<{ret: number, data: string}>}
 */
async function queryData(sql) {
    let res ={'ret':0, 'data':''};
    try{
        db = new sqlite3.Database(dbPath);

        let rows = await new Promise((resolve, reject) =>{
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        res.ret = 0;
        res.data = rows;
    }catch (err){
        res.ret = -1;
        res.data = err.message;
    }finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }

    return res;
}

module.exports = {
    updateData,
    queryData,
    databaseInit
};
