const until = require("@/comm/until");
const dbTool = require("@/electron/tools/database");
const {StrategyScript} = require("@/comm/vo");

const getScriptByStrategyDetailsID = (id, callback) => {
    dbTool.getKnex().select('*').from('strategy_script').where('StrategyDetailsID', id).then((result) =>{
        let strategyScriptArr = new Array();
        for (const row of result) {
            let strategyScript = new StrategyScript().getJson();

            strategyScript.id = row.ID;
            strategyScript.strategyDetailsID = row.StrategyDetailsID;
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

const getScriptByStrategyDetailsIDAsync = async (id) => {
    try {
        const result = await dbTool.getKnex().select('*').from('strategy_script').where('StrategyDetailsID', id);

        let strategyScriptArr = [];
        for (const row of result) {
            let strategyScript = new StrategyScript().getJson();
            strategyScript.id = row.ID;
            strategyScript.strategyDetailsID = row.StrategyDetailsID;
            strategyScript.type = row.Type == 1 ? true : false;
            strategyScript.priorExec = row.PriorExec == 1 ? true : false;
            strategyScript.script = row.Script;

            strategyScriptArr.push(strategyScript);
        }

        return new Promise((resolve) =>{
            resolve({'ret': 0, 'data': strategyScriptArr});
        });
    } catch (err) {
        return new Promise((resolve) =>{
            resolve({'ret': -1, 'data': err});
        });
    }
}

const saveScript = (scripts, callback) =>{

    let insertData = new Array();

    for (const scriptObj of scripts) {
        insertData.push({'ID': until.getUUID(), 'StrategyDetailsID':scriptObj.strategyDetailsID, 'Type':scriptObj.type, 'PriorExec':scriptObj.priorExec, 'Script':scriptObj.script})
    }


    dbTool.getKnex().transaction((trx) => {
        return trx('strategy_script').where('StrategyDetailsID' , insertData[0].StrategyDetailsID).del().then(()=>{
            return trx('strategy_script').insert(insertData);
        })
    }).then((inserteds) => {
        let res ={'ret':0, 'data':inserteds};
        callback(res);
    }).catch((error) =>{
        let res ={'ret':-1, 'data':error};
        console.log(error)
        callback(res);
    });

}

module.exports = {
    saveScript,
    getScriptByStrategyDetailsID,
    getScriptByStrategyDetailsIDAsync
};