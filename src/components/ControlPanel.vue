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
              <a-button type="link" @click="startup(record)" :disabled="optBtnDisabled"><play-circle-two-tone /></a-button>
            </span>
            <span v-else-if="record.status == 'executing'">
              <a-button type="link"><loading-outlined /></a-button>
            </span>
            <span v-else>
              <a-button type="link" @click="shutdown(record)" :disabled="optBtnDisabled"><pause-circle-two-tone /></a-button>
            </span>
            <span>
              <a-button type="link" @click = "delData(record.id, 1)" :disabled="optBtnDisabled"><delete-two-tone /></a-button>
            </span>
            <span>
              <a-button type="link" @click="showAddStrategyDetailModal(record.id, record.startegiesName)" :disabled="optBtnDisabled"><PlusCircleTwoTone /></a-button>
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
          <a-table :columns="innerColumns" :data-source="record.strategyDetails" :pagination="false" :customRow="customRow" :customHeaderRow="customHeaderRow">
            <template #bodyCell="{ column , record}">
              <template v-if="column.key === 'move'">
                <a-button type="link" @click ="moveStrategyDetailIndex(record.key, 'up')" size="small"><UpOutlined two-tone-color="blue" style="font-size: 10px;"/></a-button>
                <a-button type="link" @click ="moveStrategyDetailIndex(record.key, 'down')" size="small"><DownOutlined two-tone-color="blue" style="font-size: 10px;"/></a-button>
              </template>
              <template v-if="column.key === 'operation'">
                <a-button type="link" @click = "delData(record.key, 0)" size="small"><MinusCircleTwoTone two-tone-color="red"/></a-button>
                <a-button type="link" @click = "showStrategyScriptModal(record.key)" size="small"><CodeTwoTone/></a-button>
              </template>
              <template v-if="column.key === 'stat'">
                <span v-if="record.stat == 1">
                  <a-badge status="success"/>
                  <a-tag :bordered="false" color="success" style="font-size: 9px;"><b>NORMALLY</b></a-tag>
                </span>
                <span v-else>
                  <a-tooltip placement="top">
                    <template #title>
                      <span>{{ record.statMsg }}</span>
                    </template>
                    <a-badge status="error"/>
                    <a-tag :bordered="false" color="error" style="font-size: 9px;"><b>ABNORMAL</b></a-tag>
                  </a-tooltip>
                </span>
              </template>
            </template>
          </a-table>
        </template>
      </a-table>
    </a-col>
  </a-row>

  <a-modal title="新增关联环境" width="800" v-model:visible="isStrategyModalVisible" @cancel="isStrategyModalVisible = false">
    <a-form
        :model="strategyInfo.strategyDetails[0]"
        ref="newFormRef"
        name="basic"
        autocomplete="off">
      <a-form-item label="策略名称" name="strategyName">
        <b>{{ strategyInfo.strategyName }}</b>
      </a-form-item>
      <a-form-item
          label="可执行文件"
          name="executablePath">
        <input type="file" @change="strategyDetailHandleFileChange" accept=".exe,.bat,.service"/>
      </a-form-item>

      <a-table
          :row-selection="{ onChange: onSelectChange}"
          :data-source="scanData"
          :columns="sanTableColumns"
      />

    </a-form>
    <template #footer>
      <a-button @click="isStrategyModalVisible = false">取消</a-button>
      <a-button type="primary" @click="saveStrategyDetail">确定</a-button>
    </template>
  </a-modal>

  <a-modal title="环境关联脚本设置" width="800" v-model:visible="isScriptModalVisible" @cancel="isScriptModalVisible = false">
    <a-form
        name="scriptModal"
        :model="strategyInfo.strategyScript"
        autocomplete="off">
      <a-row>
        <a-col :span="11">
            <script-editor
                v-model:script="strategyInfo.strategyScript.startup.script"
                v-model:switched="strategyInfo.strategyScript.startup.priorExec"
                switchOnTip="在环境启用前执行"
                switch-off-tip="在环境启用后执行"
                title="启用时脚本">
            </script-editor>
        </a-col>
        <a-col :span="2"></a-col>
        <a-col :span="11">
          <script-editor
              v-model:script="strategyInfo.strategyScript.shutdown.script"
              v-model:switched="strategyInfo.strategyScript.shutdown.priorExec"
              switchOnTip="在环境关停前执行"
              switch-off-tip="在环境关停后执行"
              title="关停时脚本">
          </script-editor>
        </a-col>
      </a-row>

    </a-form>
    <template #footer>
      <a-button @click="isScriptModalVisible = false">取消</a-button>
      <a-button type="primary" @click="saveStrategyScript">确定</a-button>
    </template>
  </a-modal>
</template>

<script>

import { defineComponent, ref, onMounted} from 'vue';
import { notification, Modal } from 'ant-design-vue';
import { PlayCircleTwoTone, DeleteTwoTone, PauseCircleTwoTone, SyncOutlined, CodeTwoTone, MinusCircleTwoTone, DownOutlined, UpOutlined, PlusCircleTwoTone, LoadingOutlined} from '@ant-design/icons-vue'

import ScriptEditor from "@/components/ScriptEditor";
import {Strategy} from "@/comm/vo";

const enums = require('@/comm/enum');
// const { StrategyScript } = require('@/comm/vo');
const handlerMsg = require('@/electron/handlers/enum');

const sanTableColumns = [{
  title:'可执行文件名称',
  dataIndex:'exec',
  key:'exec'
},{
  title:'路径',
  dataIndex:'executablePath',
  key:'executablePath'
},{
  title:'关联环境名称',
  dataIndex:'associatedEnvironment',
  key:'associatedEnvironment'
},{
  title:'环境类型',
  dataIndex:'environmentType',
  key:'environmentType'
},{
  title:'备注',
  dataIndex:'environmentDetial',
  key:'environmentDetial'
}];

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
  key:'move',
  width:20
},{
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
},{
  title: '操作',
  key:'operation'
}];


export default defineComponent({
  setup() {

    const data = ref([]);

    const optBtnDisabled = ref(false);

    const scanData = ref([]);


    const strategyInfo = ref(new Strategy().getJson());

    //策略脚本窗口可见状态
    const isScriptModalVisible = ref(false);

    //策略明细新增窗口可见状态
    const isStrategyModalVisible = ref(false);
    const isScan = ref(false);

    const strategyDetailHandleFileChange = (e) =>{
      // strategyInfo.value.strategyDetails[0].executablePath = e.target.files[0].path;

      scanData.value = [];
      window.electronAPI.once(handlerMsg.MSG_SCAN_FILE,  (result) =>{
        if(result.ret == 0){
          if(Array.isArray(result.data) && result.data.length > 0){
            for (let i = 0; i < result.data.length; i++){
              scanData.value.push({
                key: result.data[i].key,
                exec: result.data[i].exec,
                executablePath: result.data[i].path,
                associatedEnvironment: result.data[i].env,
                environmentDetial: result.data[i].comment,
                environmentType: result.data[i].type
              });
            }
          }
        }
      });

      window.electronAPI.call(handlerMsg.MSG_SCAN_FILE, e.target.files[0].path);
    }

    const showAddStrategyDetailModal = (strategyKey, startegiesName) =>{
      isStrategyModalVisible.value = true;
      strategyInfo.value.id = strategyKey;
      strategyInfo.value.strategyName = startegiesName;
      strategyInfo.value.strategyDetails = [];
      scanData.value = [];
    }

    const onSelectChange = (selectedRowKeys, selectedRows) =>{
      strategyInfo.value.strategyDetails = selectedRows;
    }

    const saveStrategyDetail = () =>{
      window.electronAPI.once(handlerMsg.MSG_SAVE_STRATEGY,  (result) =>{
        if(result.ret == 0){
          notification.success({
            message: '提醒',
            description: '保存成功'
          });
          isStrategyModalVisible.value = false;
          reflash();
        }else{
          notification.error({
            message: '提醒',
            description: '保存失败，原因：' + result.data
          });
        }
      });

      let strategy = JSON.parse(JSON.stringify(strategyInfo.value));

      window.electronAPI.call(handlerMsg.MSG_SAVE_STRATEGY, strategy);
    }

    const moveStrategyDetailIndex = (id, moveType) =>{
      window.electronAPI.once(handlerMsg.MSG_MOVE_STRATEGY_DETAIL_INDEX, (result) =>{
        if(result.ret == 0){
          reflash();
        }else{
          notification.error({
            message: '提醒',
            description: result.data
          });
        }
      });

      window.electronAPI.call(handlerMsg.MSG_MOVE_STRATEGY_DETAIL_INDEX, {'strategyDetailId':id, 'moveType':moveType});
    }


    const showStrategyScriptModal = (StrategyDetailsID) =>{
      isScriptModalVisible.value = true;

      strategyInfo.value.id = StrategyDetailsID;

      strategyInfo.value.strategyScript.startup.strategyDetailsID = StrategyDetailsID;
      strategyInfo.value.strategyScript.startup.script = '';
      strategyInfo.value.strategyScript.startup.priorExec = false;
      strategyInfo.value.strategyScript.startup.type = enums.StrategyScriptType.WITH_STARTUP;
      strategyInfo.value.strategyScript.shutdown.strategyDetailsID = StrategyDetailsID;
      strategyInfo.value.strategyScript.shutdown.script = '';
      strategyInfo.value.strategyScript.shutdown.priorExec = false;
      strategyInfo.value.strategyScript.shutdown.type = enums.StrategyScriptType.WITH_SHUTDOWN;

      window.electronAPI.once(handlerMsg.MSG_GET_SCRIPT_BY_STRATEGY,  (result) =>{

        if(result.ret == 0){

          for (const script of result.data) {
            if (script.type == enums.StrategyScriptType.WITH_STARTUP){
              strategyInfo.value.strategyScript.startup.script = script.script;
              strategyInfo.value.strategyScript.startup.priorExec = script.priorExec;
            }else {
              strategyInfo.value.strategyScript.shutdown.script = script.script;
              strategyInfo.value.strategyScript.shutdown.priorExec = script.priorExec;
            }
          }
        }else {
          notification.error({
            message: '提醒',
            description:'查询失败，原因：' + result.data
          })
        }
      });

      window.electronAPI.call(handlerMsg.MSG_GET_SCRIPT_BY_STRATEGY, StrategyDetailsID);
    }

    const saveStrategyScript = () =>{

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

        isScriptModalVisible.value = false;
      });

      //为了解决An object could not be cloned报错的愚蠢的做法，后续换TypeScript要重点解决
      let startupScript = JSON.parse(JSON.stringify(strategyInfo.value.strategyScript.startup));
      let shutdownScript = JSON.parse(JSON.stringify(strategyInfo.value.strategyScript.shutdown));

      window.electronAPI.call(handlerMsg.MSG_SVAE_SCRIPT, [startupScript, shutdownScript]);
    }

    const reflash = ()=> {

      //数据刷新成功
      window.electronAPI.once(handlerMsg.MSG_GET_ALL_STRATEGY_BY_STAT, function (result) {
        if(result.ret == 0){
          data.value = [];
          data.value = result.data;
        }else {
          notification.error({
            message: '提醒',
            description:'查询失败，原因：' + result.data
          })
        }
      })

      window.electronAPI.call(handlerMsg.MSG_GET_ALL_STRATEGY_BY_STAT);
    }

    const delData = (id, type) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          let delIds = [id];
          const msgType = type === 1 ? handlerMsg.MSG_DEL_STRATEGY : handlerMsg.MSG_DEL_STRATEGY_DETAIL;
          const successMessage = '删除成功';
          const errorMessage = '删除失败，原因：${result.data}';

          const handleResult = (result) => {
            if (result.ret === 0) {
              reflash();
              notification.success({
                message: '提醒',
                description: successMessage
              });
            } else {
              notification.error({
                message: '提醒',
                description: errorMessage.replace('${result.data}', result.data)
              });
            }
          };

          window.electronAPI.once(msgType, handleResult);
          window.electronAPI.call(msgType, delIds);
        }
      });
    };



    const startup = (record) => {
      let recordStr = JSON.stringify(record)

      Modal.confirm({
        title: '启用',
        content: '确定启用吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk:() => {
          record.status = 'executing';
          //禁用所有策略的可操作按钮
          optBtnDisabled.value = true;
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

            //禁用所有策略的可操作按钮
            optBtnDisabled.value = false;
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
          record.status = 'executing';
          //禁用所有策略的可操作按钮
          optBtnDisabled.value = true;

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

            //禁用所有策略的可操作按钮
            optBtnDisabled.value = false;
          })

          window.electronAPI.call(handlerMsg.MSG_ENV_SHUTDOWN, recordStr);
        }
      });
    };

    //每次加载时刷新数据
    onMounted(() => {
      reflash();
    });

    const customRow = () => {
      return {
        style: {
          'font-size' : '10px'
        },
      }
    }

    const customHeaderRow = () => {
      return {
        style: {
          'font-size' : '10px'
        },
      }
    }

    return {
      columns,
      innerColumns,
      sanTableColumns,
      onSelectChange,
      data,
      scanData,
      reflash,
      delData,
      startup,
      shutdown,
      isScan,
      strategyInfo,
      isScriptModalVisible,
      isStrategyModalVisible,
      showStrategyScriptModal,
      showAddStrategyDetailModal,
      strategyDetailHandleFileChange,
      saveStrategyDetail,
      moveStrategyDetailIndex,
      saveStrategyScript,
      customRow,
      customHeaderRow,
      optBtnDisabled
    };
  },
  name: "ControlPanel",
  components:{
    PlayCircleTwoTone,
    DeleteTwoTone,
    PauseCircleTwoTone,
    SyncOutlined,
    CodeTwoTone,
    MinusCircleTwoTone,
    DownOutlined,
    UpOutlined,
    PlusCircleTwoTone,
    LoadingOutlined,
    ScriptEditor
  }
})


</script>

<style scoped>

.innerTable{
  font-size: 9px;
}

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