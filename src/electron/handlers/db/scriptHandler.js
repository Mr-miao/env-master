const until = require("@/comm/until");
const dbTool = require("@/electron/tools/database");
const {StrategyScript} = require("@/comm/vo");

const getScriptByStrategyID = (id, callback) => {
    dbTool.getKnex().select('*').from('strategy_script').where('StrategyID', id).then((result) =>{
        let strategyScriptArr = new Array();
        for (const row of result) {
            let strategyScript = new StrategyScript().getJson();

            strategyScript.id = row.ID;
            strategyScript.strategyKey = row.StrategyID;
            strategyScript.type = row.Type == 1 ? true : false;
            strategyScript.priorExec = row.PriorExec == 1 ? true : false;
            strategyScript.script = row.Script;
            // console.log(strategyScript)
            strategyScriptArr.push(strategyScript);
        }

        let res ={'ret':0, 'data':strategyScriptArr};
        callback(res);
    }).catch(err => {
        let res ={'ret':-1, 'data':err};
        callback(res);
    });

}

const saveScript = (scripts, callback) =>{

    let insertData = new Array();

    for (const scriptObj of scripts) {
        insertData.push({'ID': until.getUUID(), 'StrategyID':scriptObj.strategyKey, 'Type':scriptObj.type, 'PriorExec':scriptObj.priorExec, 'Script':scriptObj.script})
    }


    dbTool.getKnex().transaction((trx) => {
        return trx('strategy_script').where('StrategyID' , insertData[0].StrategyID).del().then(()=>{
            return trx('strategy_script').insert(insertData);
        })
    }).then((inserteds) => {
        let res ={'ret':0, 'data':inserteds};
        callback(res);
    }).catch((error) =>{
        let res ={'ret':-1, 'data':error};
        callback(res);
    });

}

module.exports = {
    saveScript,
    getScriptByStrategyID
};