const ctrl = require("@/electron/tools/ctrl");
const shell = require("@/electron/tools/shell")
const scriptHandler = require("@/electron/handlers/db/scriptHandler");
const enums = require("@/comm/enum");

const startup = (env, callback)=>{
    let record = JSON.parse(env);

    scriptHandler.getScriptByStrategyID(record.id, (res)=>{
        if (res.ret == 0){
            // console.log(res)
            for (const script of res.data) {
                if(script.type == enums.StrategyScriptType.WITH_STARTUP){
                    record.strategyScript.startup = script;
                }else {
                    record.strategyScript.shutdown = script;
                }
            }

            if(record.strategyScript.startup.priorExec){
                shell.exec(record.strategyScript.startup.script, (res) =>{
                    if(res.ret == 0){
                        ctrl.startup(record, (res) => {
                            callback(res);
                        });
                    }else {
                        callback(res);
                    }
                })
            }else {
                ctrl.startup(record, (res) => {
                    // console.log(res)
                    if(res.ret == 0){
                        shell.exec(record.strategyScript.startup.script, (res) =>{
                            callback(res);
                        });
                    }else {
                        callback(res);
                    }
                });
            }
        }else {
            callback(res);
        }
    });

}

const shutdown = (env, callback) => {
    let record = JSON.parse(env);

    scriptHandler.getScriptByStrategyID(record.id, (res)=> {
        if (res.ret == 0) {
            // console.log(res)
            for (const script of res.data) {
                if (script.type == enums.StrategyScriptType.WITH_STARTUP) {
                    record.strategyScript.startup = script;
                } else {
                    record.strategyScript.shutdown = script;
                }
            }

            if(record.strategyScript.shutdown.priorExec){
                shell.exec(record.strategyScript.shutdown.script, (res) =>{
                    if(res.ret == 0){
                        ctrl.shutdown(record, (res) => {
                            callback(res);
                        });
                    }else {
                        callback(res);
                    }
                })
            }else {
                ctrl.shutdown(record, (res) => {
                    if(res.ret == 0){
                        shell.exec(record.strategyScript.shutdown.script, (res) =>{
                            callback(res);
                        });
                    }else {
                        callback(res);
                    }
                });
            }
        }else {
            callback(res);
        }
    });


}

module.exports = {
    startup,
    shutdown
};