<template>
  <a-row>
    <a-col :span="24">
      <a-button @click="reflash">
        <template #icon><sync-outlined /></template>刷新
      </a-button>
    </a-col>
  </a-row>

  <a-row><a-col :span="24">&nbsp;</a-col></a-row>

  <a-row>
    <a-col :span="24">
      <a-table :columns="columns" rowKey="id" :data-source="data" :scroll="{ y: 400 }">
        <template #bodyCell="{ column , record}">
          <template v-if="column.key === 'operation'" >
            <span v-if="record.status == 'down'">
              <a-button type="link" @click="startup(record)"><play-circle-two-tone /></a-button>
            </span>
            <span v-else>
              <a-button type="link" @click="shutdown(record)"><pause-circle-two-tone /></a-button>
            </span>
            <span>
              <a-button type="link" @click = "delData(record.id)"><delete-two-tone /></a-button>
            </span>
            <span>
              <a-button @click = "showStrategyScriptModal(record.id)" type="link"><CodeTwoTone /></a-button>
            </span>
          </template>
          <template v-if="column.key === 'status'">
            <span v-if="record.status == 'up'">
              <a-badge status="success"/>
              <a-tag color="success"><b>UP</b></a-tag>
            </span>
            <span v-else-if="record.status == 'fault'">
              <a-badge status="warning"/>
              <a-tag color="warning"><b>FAULT</b></a-tag>
            </span>
            <span v-else>
              <a-badge status="error"/>
              <a-tag color="error"><b>DOWN</b></a-tag>
            </span>
          </template>
        </template>
        <template #expandedRowRender = "{ record }">
          <a-table :columns="innerColumns" :data-source="record.strategyDetails" :pagination="false">
            <template #bodyCell="{ column , record}">
              <template v-if="column.key === 'stat'">
                <span v-if="record.stat == 1">
                  <a-badge status="success"/>
                  <a-tag color="success"><b>NORMALLY</b></a-tag>
                </span>
                <span v-else>
                  <a-tooltip placement="top">
                    <template #title>
                      <span>{{ record.statMsg }}</span>
                    </template>
                    <a-badge status="error"/>
                    <a-tag color="error"><b>ABNORMAL</b></a-tag>
                  </a-tooltip>
                </span>
              </template>
            </template>
          </a-table>
<!--          <a-row>-->
<!--            <a-col :span="12">-->
<!--              <script-editor-->
<!--                  v-model:script="record.strategyScript.startup.script"-->
<!--                  v-model:switched="record.strategyScript.startup.priorExec"-->
<!--                  switchOnTip="在环境启用前执行"-->
<!--                  switch-off-tip="在环境启用后执行"-->
<!--                  :maxLines="3"-->
<!--                  :minLines="3"-->
<!--                  :readonly="true"-->
<!--                  title="启用时脚本">-->
<!--              </script-editor>-->
<!--            </a-col>-->
<!--            <a-col :span="12">-->
<!--              <script-editor-->
<!--                  v-model:script="record.strategyScript.shutdown.script"-->
<!--                  v-model:switched="record.strategyScript.shutdown.priorExec"-->
<!--                  switchOnTip="在环境关停前执行"-->
<!--                  switch-off-tip="在环境关停后执行"-->
<!--                  :maxLines="3"-->
<!--                  :minLines="3"-->
<!--                  :readonly="true"-->
<!--                  title="关停时脚本">-->
<!--              </script-editor>-->
<!--            </a-col>-->
<!--          </a-row>-->
        </template>
      </a-table>
    </a-col>
  </a-row>
  <a-modal title="环境关联脚本设置" width="800" v-model:visible="isStrategyScriptModalVisible" @cancel="isStrategyScriptModalVisible = false">
    <a-form
        name="scriptModal"
        :model="strategyScript"
        autocomplete="off">
      <a-row>
        <a-col :span="11">
            <script-editor
                v-model:script="strategyScript.scriptWithStart"
                v-model:switched="strategyScript.startScriptPriorExec"
                switchOnTip="在环境启用前执行"
                switch-off-tip="在环境启用后执行"
                title="启用时脚本">
            </script-editor>
        </a-col>
        <a-col :span="2"></a-col>
        <a-col :span="11">
          <script-editor
              v-model:script="strategyScript.scriptWithShutdown"
              v-model:switched="strategyScript.shutdownScriptPriorExec"
              switchOnTip="在环境关停前执行"
              switch-off-tip="在环境关停后执行"
              title="关停时脚本">
          </script-editor>
        </a-col>
      </a-row>

    </a-form>
    <template #footer>
      <a-button @click="isStrategyScriptModalVisible = false">取消</a-button>
      <a-button type="primary" @click="saveStrategyScript">确定</a-button>
    </template>
  </a-modal>
</template>

<script>

import { defineComponent, ref, onMounted} from 'vue';
import { notification, Modal } from 'ant-design-vue';
import { PlayCircleTwoTone, DeleteTwoTone, PauseCircleTwoTone, SyncOutlined, CodeTwoTone} from '@ant-design/icons-vue'

import ScriptEditor from "@/components/ScriptEditor";

const enums = require('@/comm/enum');
const { StrategyScript } = require('@/comm/vo');
const handlerMsg = require('@/electron/handlers/enum');

const columns = [{
  title: '策略名称',
  dataIndex: 'startegiesName',
  key: 'startegiesName',
}, {
  title: '策略描述',
  dataIndex: 'description',
  key: 'description',
}, {
  title: '策略状态',
  dataIndex: 'status',
  key: 'status',
}, {
  title: '操作',
  key: 'operation',
}];

const innerColumns = [{
  title:'可执行文件名称',
  dataIndex:'exec',
  key:'exec'
},{
  title:'路径',
  dataIndex:'path',
  key:'path'
},{
  title:'关联环境名称',
  dataIndex:'env',
  key:'env'
},{
  title:'环境类型',
  dataIndex:'type',
  key:'type'
},{
  title:'状态',
  dataIndex:'stat',
  key:'stat'
}];


export default defineComponent({
  setup() {

    const data = ref([]);

    const scriptStrategyKey = ref('');

    const strategyScript = ref({
      scriptWithStart:'',
      startScriptPriorExec:false,
      scriptWithShutdown:'',
      shutdownScriptPriorExec:false
    })


    //保存到现有策略模态窗口可见状态控制变量
    const isStrategyScriptModalVisible = ref(false);

    const showStrategyScriptModal = (strategyKey) =>{
      isStrategyScriptModalVisible.value = true;

      scriptStrategyKey.value = strategyKey;

      strategyScript.value.scriptWithStart = '';
      strategyScript.value.startScriptPriorExec = false;
      strategyScript.value.scriptWithShutdown = '';
      strategyScript.value.shutdownScriptPriorExec = false;

      window.electronAPI.once(handlerMsg.MSG_EGT_SCRIPT_BY_STRATEGY,  (result) =>{

        if(result.ret == 0){

          for (const script of result.data) {
            if (script.type == enums.StrategyScriptType.WITH_STARTUP){
              strategyScript.value.scriptWithStart = script.script;
              strategyScript.value.startScriptPriorExec = script.priorExec;
            }else {
              strategyScript.value.scriptWithShutdown = script.script;
              strategyScript.value.shutdownScriptPriorExec = script.priorExec;
            }
          }
        }else {
          notification.error({
            message: '提醒',
            description:'查询失败，原因：' + result.data
          })
        }
      });

      window.electronAPI.call(handlerMsg.MSG_EGT_SCRIPT_BY_STRATEGY, strategyKey);
    }

    const saveStrategyScript = () =>{
      let strategyScriptWithStart = new StrategyScript().getJson();
      let strategyScriptWithShutdown = new StrategyScript().getJson();

      strategyScriptWithStart.strategyKey = scriptStrategyKey.value;
      strategyScriptWithStart.type = enums.StrategyScriptType.WITH_STARTUP;
      strategyScriptWithStart.script = strategyScript.value.scriptWithStart;
      strategyScriptWithStart.priorExec = strategyScript.value.startScriptPriorExec;

      strategyScriptWithShutdown.strategyKey = scriptStrategyKey.value;
      strategyScriptWithShutdown.type = enums.StrategyScriptType.WITH_SHUTDOWN;
      strategyScriptWithShutdown.script = strategyScript.value.scriptWithShutdown;
      strategyScriptWithShutdown.priorExec = strategyScript.value.shutdownScriptPriorExec;

      window.electronAPI.once(handlerMsg.MSG_SVAE_SCRIPT,  (result) =>{

        if(result.ret == 0){
          notification.success({
            message: '提醒',
            description:'保存成功'
          })
        }else {
          notification.error({
            message: '提醒',
            description:'保存失败，原因：' + result.data
          })
        }

        isStrategyScriptModalVisible.value = false;
      });

      window.electronAPI.call(handlerMsg.MSG_SVAE_SCRIPT, [strategyScriptWithStart, strategyScriptWithShutdown]);
    }

    const reflash = ()=> {

      //数据刷新成功
      window.electronAPI.once(handlerMsg.MSG_GET_ALL_STRATEGY_BY_STAT, function (result) {
        console.log(result)
        if(result.ret == 0){
          data.value = [];
          data.value = result.data;
          // console.log(result.data )
        }else {
          notification.error({
            message: '提醒',
            description:'查询失败，原因：' + result.data
          })
        }
      })

      window.electronAPI.call(handlerMsg.MSG_GET_ALL_STRATEGY_BY_STAT);
    }

    const delData = function (id){

      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk:() => {
          window.electronAPI.once(handlerMsg.MSG_DEL_STRATEGY, (result) =>{
            // console.log(result)
            if(result.ret == 0){
              reflash();
              notification.success({
                message: '提醒',
                description:'删除成功'
              })
            }else {
              notification.error({
                message: '提醒',
                description:'删除失败，原因：' + result.data
              })
            }
          })

          let delIds = [id];

          window.electronAPI.call(handlerMsg.MSG_DEL_STRATEGY, delIds);
        }
      });

    }


    const startup = (record) => {
      let recordStr = JSON.stringify(record)

      console.log(recordStr)

      Modal.confirm({
        title: '启用',
        content: '确定启用吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk:() => {
          window.electronAPI.once(handlerMsg.MSG_ENV_STARTUP, (res) =>{
            reflash();
            if(res.ret == 0){

              notification.success({
                message: '提醒',
                description:'执行成功'
              })
            }else {
              notification.error({
                message: '提醒',
                description:'执行失败，原因：' + res.data
              })
            }
          })

          window.electronAPI.call(handlerMsg.MSG_ENV_STARTUP, recordStr);
        }
      });


    };

    const shutdown = (record) => {
      let recordStr = JSON.stringify(record);

      Modal.confirm({
        title: '禁用',
        content: '确定禁用吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk:() => {
          window.electronAPI.once(handlerMsg.MSG_ENV_SHUTDOWN, (res) =>{
            reflash();
            if(res.ret == 0){

              notification.success({
                message: '提醒',
                description:'执行成功'
              })
            }else {
              notification.error({
                message: '提醒',
                description:'执行失败，原因：' + res.data
              })
            }
          })

          window.electronAPI.call(handlerMsg.MSG_ENV_SHUTDOWN, recordStr);
        }
      });
    };

    //每次加载时刷新数据
    onMounted(() => {
      reflash();
    });

    return {
      columns,
      innerColumns,
      data,
      reflash,
      delData,
      startup,
      shutdown,
      strategyScript,
      scriptStrategyKey,
      isStrategyScriptModalVisible,
      showStrategyScriptModal,
      saveStrategyScript
    };
  },
  name: "ControlPanel",
  components:{
    PlayCircleTwoTone,
    DeleteTwoTone,
    PauseCircleTwoTone,
    SyncOutlined,
    CodeTwoTone,
    ScriptEditor
  }
})


</script>

<style scoped>

/deep/ .ant-table-body::-webkit-scrollbar,
.info::-webkit-scrollbar {
  height: 3px;
  width: 3px;
  /*background-color: #3498db7e;*/
}


   /deep/ .ant-table-body::-webkit-scrollbar-thumb,
   .info::-webkit-scrollbar-thumb {
     border-radius: 3px;
     /*background-color: #3498db;*/
   }
</style>