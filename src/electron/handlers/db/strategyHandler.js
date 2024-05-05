const dbTool = require("@/electron/tools/database");
const until = require("@/comm/until");
const ctrl = require("@/electron/tools/ctrl");

const { Strategy } = require("@/comm/vo");

const getStrategy = (strategy, callback) => {
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
        .leftJoin('strategy_details', 'strategies.ID', 'strategy_details.StrategyID')
        .orderBy('strategy_details.index', 'asc').then((res) => {

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
                // 进行状态判断
                if (tempData[key].upStatNum === tempData[key].strategyDetails.length) {
                    tempData[key].status = 'up';
                } else if (tempData[key].upStatNum === 0) {
                    tempData[key].status = 'down';
                } else {
                    tempData[key].status = 'fault';
                }
            }

            // 对 tempData 按 startegiesName 进行降序排序（支持中文）
            const sortedTempData = Object.values(tempData).sort((a, b) => {
                // 使用 Intl.Collator 对象处理字符串比较以支持中文
                const collator = new Intl.Collator('zh-Hans-CN', { sensitivity: 'base' });
                return collator.compare(b.startegiesName, a.startegiesName);
            });

            // 将排序后的数据推送到 data 数组
            sortedTempData.forEach(item => data.push(item));

            ret.data = data;
            callback(ret);

        }).catch((error) => {
            let res ={'ret':-1, 'data':error};
            callback(res);
        });

}

const deleteStrategy = (strategyIds, callback)=>{

    if(strategyIds){
        dbTool.getKnex().transaction((trx) => {
            //数据库使用了级联删除，所以只删除主表数据即可
            return  trx('strategies').whereIn('ID' , strategyIds).del();
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
            return trx.insert({ID: strategieKey, StartegiesName:strategy.startegiesName, Description: strategy.description}).into('strategies')
                .then(() => {
                    let strategyDetailsArr = new Array();
                    for (let i = 0; i < strategy.strategyDetails.length; i++) {
                        let row = strategy.strategyDetails[i];
                        strategyDetailsArr.push({ID: until.getUUID(), Index:i + 1, StrategyID:strategieKey, AssociatedEnvironment:row.associatedEnvironment, EnvironmentType:row.environmentType, ExecutablePath:row.executablePath, EnvironmentExecDetial:row.environmentDetial});
                    }
                    return trx.insert(strategyDetailsArr).into('strategy_details');
                })
        }).then(function(inserts) {
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
                .update({'StartegiesName':startegiesName,'Description':description}).then(()=>{
                    return trx('strategy_details').max('Index as max_index')
                        .then(maxIndexResult => {
                            // maxIndexResult是一个对象，通常键是列名，值是计算出的最大值
                            const maxIndex = maxIndexResult[0].max_index;
                            // console.log(strategy.strategyDetails)
                            let strategyDetailsArr = new Array();
                            for (let i = 1; i <= strategy.strategyDetails.length; i++) {
                                let row = strategy.strategyDetails[i - 1];
                                strategyDetailsArr.push({'ID':until.getUUID(), 'Index':maxIndex + i, 'StrategyID':strategy.id, 'AssociatedEnvironment':row.associatedEnvironment, 'EnvironmentType':row.environmentType, 'ExecutablePath':row.executablePath, 'EnvironmentExecDetial':row.environmentDetial});
                            }

                            return trx.insert(strategyDetailsArr).into('strategy_details');
                        });
                })
        }).then(function(updates) {
            let res ={'ret':0, 'data':updates};
            callback(res);
        }).catch(function(error) {
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

/**
 * 移动策略明细执行序列
 * @param strategyDetailId 策略明细ID
 * @param moveType 移动方式
 * @param callback
 */
const moveStrategyDetailIndex = async (strategyDetailId, moveType, callback) => {
    try {
        const knex = dbTool.getKnex();
        const currentIndex = await knex.select('Index').from('strategy_details').where('ID', strategyDetailId);
        const maxIndex = await knex('strategy_details').max('Index as max_index');

        if (moveType === 'down' && currentIndex[0].Index >= maxIndex[0].max_index) {
            const errorResponse = {
                ret: -1,
                data: '当前序列已为最大序列，无法下移'
            };
            callback(errorResponse);
            return;
        }

        if (moveType === 'up' && currentIndex[0].Index === 1) {
            const errorResponse = {
                ret: -1,
                data: '当前序列已为第一序列，无法上移'
            };
            callback(errorResponse);
            return;
        }

        let replaceIndex = currentIndex[0].Index;
        if (moveType === 'up') {
            replaceIndex -= 1;
        } else if (moveType === 'down') {
            replaceIndex += 1;
        }

        await knex.transaction(trx => {
            return trx('strategy_details')
                .where('Index', replaceIndex)
                .update({ Index: currentIndex[0].Index })
                .then(() => {
                    return trx('strategy_details').where('ID', strategyDetailId).update({ Index: replaceIndex });
                });
        });

        const successResponse = {
            ret: 0,
            data: '索引移动成功'
        };

        callback(successResponse);

    } catch (error) {
        const errorResponse = {
            ret: -1,
            data: error.message || error
        };
        callback(errorResponse);
    }
};





/**
 * 删除策略明细
 * @param strategyDetailId
 * @param callback
 */
const deleteStrategyDetail = (strategyDetailId, callback)=>{

    if(strategyDetailId){
        dbTool.getKnex().transaction((trx) => {
            return  trx('strategy_details').whereIn('ID' , strategyDetailId).del();
        }).then(()=>{
            let res ={'ret':0, 'data':''};
            callback(res);
        }).catch((err) => {
            let res ={'ret':-1, 'data':err};
            callback(res);
        });

    }
}


module.exports = {
    saveStrategy,
    getStrategy,
    deleteStrategy,
    getAllStrategyByStat,
    deleteStrategyDetail,
    moveStrategyDetailIndex
};