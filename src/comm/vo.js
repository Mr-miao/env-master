/**
 * 策略脚本VO
 */
class StrategyScript {
    constructor() {
        this.data = {
            id:'',
            strategyKey : '',  //策略ID
            type:true,            //脚本类型
            priorExec:false,   //是否先于关联环境运行
            script : ''        //脚本详情
        };
    }

    // 获取 JSON 数据
    getJson() {
        return this.data;
    }
}


/**
 * 策略VO
 */
class Strategy {
    constructor() {
        this.data = {
            id:'',                                      //ID
            startegiesName : '',                        //策略名称
            description:'',                             //策略描述
            strategyDetails:[],                         //关联环境详情
            strategyScript:{                            //关联脚本
                startup:new StrategyScript().getJson(), //启动时脚本
                shutdown:new StrategyScript().getJson() //关停时脚本
            }
        };
    }

    // 获取 JSON 数据
    getJson() {
        return this.data;
    }
}

/**
 * 策略明细VO
 */
class StrategyDetails {
    constructor() {
        this.data = {
            id:'',                      //ID
            strategyID : '',            //策略ID
            associatedEnvironment:'',   //关联环境名称
            environmentType:'',         //关联环境类型
            executablePath:'',          //关联环境的可执行程序路径
            environmentDetial:''        //关联环境的详细描述
        };
    }

    // 获取 JSON 数据
    getJson() {
        return this.data;
    }
}

module.exports = {
    StrategyScript,
    Strategy,
    StrategyDetails
};