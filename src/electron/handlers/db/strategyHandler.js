const dbTool = require("@/electron/tools/database");
const until = require("@/comm/until");
const ctrl = require("@/electron/tools/ctrl");
// const scriptHandler = require("@/electron/handlers/db/scriptHandler");

const { Strategy } = require("@/comm/vo");
// const enums = require("@/comm/enum");

const getStrategy = (strategy, callback) => {
    // console.log(strategy)
    if (strategy){
        dbTool.getKnex()
            .select()
            .table('strategies')
            .whereLike('StartegiesName', '%'  + strategy.startegiesName +  '%').then((res) =>{
            callback({ret : 0, data : res})
        }).catch(err =>{
            callback({ret : -1, data : err})
        });
    }else{
        dbTool.getKnex()
            .select()
            .table('strategies').then((res) =>{
            callback({ret : 0, data : res})
        }).catch(err =>{
            callback({ret : -1, data : err})
        });

    }

}

const getAllStrategyByStat = (callback) =>{

    dbTool.getKnex()
        .select('strategies.ID AS Sid',
            'strategies.StartegiesName',
            'strategies.Description',
            'strategy_details.ID AS Did',
            'strategy_details.ExecutablePath',
            'strategy_details.EnvironmentType',
            'strategy_details.AssociatedEnvironment')
        .from('strategies')
        .leftJoin('strategy_details', 'strategies.ID', 'strategy_details.StrategyID').then((res) => {

            let data = new Array();

            let ret = {
                ret : 0,
                data : ''
            };

            let tempData = new Array();
            let startegieStat = 'up';
            //循环查询结果
            for (let i = 0; i < res.length; i++) {
                //获取父行的数据
                let item = tempData[res[i].Sid];

                //构建子表数据
                let innerItem = {
                    exec: until.getFileNameByPath(res[i].ExecutablePath),
                    path: res[i].ExecutablePath,
                    env: res[i].AssociatedEnvironment,
                    type: res[i].EnvironmentType,
                    key: res[i].Did,
                    stat: 'null',
                    statMsg: ''
                };

                //获取子表各个环境项的运行状态
                let stat = ctrl.getStat(innerItem);

                innerItem.stat = stat.ret;
                innerItem.statMsg = stat.data;

                //检查父行数据是否已经构建
                if (item) {

                    //如果当前查询的环境是启用的就增加一个基数，用于最后统计策略的实时状态
                    if(innerItem.stat == 1){
                        item.upStatNum++;
                    }

                    item.strategyDetails.push(innerItem);

                } else {
                    //如未构建父行数据，进行构建
                    item = new Strategy().getJson();
                    item.id = res[i].Sid;
                    item.startegiesName = res[i].StartegiesName;
                    item.description = res[i].Description;
                    item.strategyDetails = [innerItem];
                    item.status = startegieStat;
                    item.upStatNum = innerItem.stat == 1 ? 1 : 0

                    tempData[item.id] = item;

                }

            }


            for (let key in tempData) {
                //进行状态判断
                if(tempData[key].upStatNum == tempData[key].strategyDetails.length){
                    tempData[key].status = 'up'
                }else if(tempData[key].upStatNum == 0){
                    tempData[key].status = 'down'
                }else {
                    tempData[key].status = 'fault'
                }
                data.push(tempData[key]);
            }

            ret.data = data;
            // console.log(ret.data[1].strategyScript)
            callback(ret);
        }).catch((error) => {
            let res ={'ret':-1, 'data':error};
            callback(res);
        });

}

const deleteStrategy = (strategyIds, callback)=>{

    if(strategyIds){
        dbTool.getKnex().transaction((trx) => {
            return  trx('strategies').whereIn('ID' , strategyIds).del().then(() => {
                return  trx('strategy_details').whereIn('StrategyID' , strategyIds).del()
            })
        }).then(()=>{
            let res ={'ret':0, 'data':''};
            callback(res);
        }).catch((err) => {
            let res ={'ret':-1, 'data':err};
            callback(res);
        });

    }
}

const saveStrategy = (strategy, callback) =>{

    let newData = ()=>{
        let strategieKey = until.getUUID();

        dbTool.getKnex().transaction((trx) => {
            return trx.insert({ID: strategieKey, StartegiesName:strategy.startegiesName, Description: strategy.description})
                .into('strategies')
                .then(() => {
                    let strategyDetailsArr = new Array();
                    for (let i = 0; i < strategy.strategyDetails.length; i++) {
                        let row = strategy.strategyDetails[i];
                        strategyDetailsArr.push({ID: until.getUUID(), StrategyID:strategieKey, AssociatedEnvironment:row.associatedEnvironment, EnvironmentType:row.environmentType, ExecutablePath:row.executablePath, EnvironmentExecDetial:row.environmentDetial});
                    }
                    return trx.insert(strategyDetailsArr).into('strategy_details');
                })
        }).then(function(inserts) {
            // console.log(inserts)
            let res ={'ret':0, 'data':inserts};
            callback(res);
        }).catch(function(error) {
            let res ={'ret':-1, 'data':error};
            callback(res);
        });

    }

    let updateDate = (finded)=>{

        let startegiesName = (strategy.startegiesName == '' || strategy.startegiesName == undefined) ? finded.StartegiesName : strategy.startegiesName;
        let description = (strategy.description == '' || strategy.description == undefined) ? finded.Description :strategy.description;

        dbTool.getKnex().transaction((trx) => {
            return trx('strategies')
                .where('ID', finded.ID)
                .update({'StartegiesName':startegiesName,'Description':description})
                .then(()=>{
                    let strategyDetailsArr = new Array();
                    for (let i = 0; i < strategy.strategyDetails.length; i++) {
                        let row = strategy.strategyDetails[i];
                        strategyDetailsArr.push({'ID':until.getUUID(), 'StrategyID':strategy.id, 'AssociatedEnvironment':row.associatedEnvironment, 'EnvironmentType':row.environmentType, 'ExecutablePath':row.executablePath, 'EnvironmentExecDetial':row.environmentDetial});
                    }
                    return trx.insert(strategyDetailsArr).into('strategy_details');
                })
        }).then(function(updates) {
            let res ={'ret':0, 'data':updates};
            callback(res);
        }).catch(function(error) {
            console.log(error)
            let res ={'ret':-1, 'data':error};
            callback(res);
        });

    }

    if(strategy.id == undefined || strategy.id == ''){
        newData();
    }else {
        dbTool.getKnex()('strategies').where('ID', strategy.id).then((result) =>{
            if (result.length > 0){
                updateDate(result[0]);
            }else {
                newData();
            }
        }).catch((error) =>{
            let res ={'ret':-1, 'data':error};
            callback(res);
        })
    }

}

module.exports = {
    saveStrategy,
    getStrategy,
    deleteStrategy,
    getAllStrategyByStat
};