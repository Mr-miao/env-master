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
      <a-table :columns="columns" :data-source="data">
        <template #bodyCell="{ column , record}">
          <template v-if="column.key === 'operation'" >
            <span v-if="record.status == 'down'">
              <a-button type="link" @click="startup(record)"><play-circle-two-tone /></a-button>
            </span>
            <span v-else>
              <a-button type="link" @click="shutdown(record)"><pause-circle-two-tone /></a-button>
            </span>
            <span style="padding-left: 10px">
              <a @click = "delData(record.key)"><delete-two-tone /></a>
            </span>
          </template>
          <template v-if="column.key === 'status'">
            <span v-if="record.status == 'up'">
              <a-badge status="success"/>
              <a-tag color="success"><b>Up</b></a-tag>
            </span>
            <span v-else-if="record.status == 'fault'">
              <a-badge status="warning"/>
              <a-tag color="warning"><b>Fault</b></a-tag>
            </span>
            <span v-else>
              <a-badge status="error"/>
              <a-tag color="error"><b>Down</b></a-tag>
            </span>
          </template>
        </template>
        <template #expandedRowRender = "{ record }">
          <a-table :columns="innerColumns" :data-source="record.innerData" :pagination="false">
          </a-table>
        </template>
      </a-table>
    </a-col>
  </a-row>
</template>

<script>

import { defineComponent, ref, onMounted} from 'vue';
import { notification, Modal } from 'ant-design-vue';
import { PlayCircleTwoTone, DeleteTwoTone, PauseCircleTwoTone, SyncOutlined} from '@ant-design/icons-vue'

import until from "../comm/until"

const columns = [{
  title: '策略名称',
  dataIndex: 'name',
  key: 'name',
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
}];


export default defineComponent({
  setup() {

    const data = ref([]);

    const reflash = ()=> {
      data.value = [];

      let sql = 'SELECT strategies.ID AS Sid, ' +
          'strategies.StartegiesName, ' +
          'strategies.State, ' +
          'strategies.Description, ' +
          'strategy_details.ID AS Did, ' +
          'strategy_details.ExecutablePath, ' +
          'strategy_details.EnvironmentType, ' +
          'strategy_details.AssociatedEnvironment ' +
          'FROM strategies LEFT JOIN strategy_details ON strategies.ID = strategy_details.StrategyID;';

      //数据库脚本执行成功事件
      window.electronAPI.onDBExecComplete(function (result) {

        if(result.ret == 0){
          let tempData = [];
          //循环查询结果
          for (let i = 0; i < result.data.length; i++) {
            //检查父行的数据是否已经构建
            let item = tempData[result.data[i].Sid];
            if(item){
              item.innerData.push({
                exec:until.getFileNameByPath(result.data[i].ExecutablePath),
                path:result.data[i].ExecutablePath,
                env:result.data[i].AssociatedEnvironment,
                type:result.data[i].EnvironmentType,
                key:result.data[i].Did
              });
            }else {
              //如未构建父行数据，进行构建
              item = {
                key: result.data[i].Sid,
                name: result.data[i].StartegiesName,
                description:result.data[i].Description,
                status:result.data[i].State,
                innerData:[{
                  exec:until.getFileNameByPath(result.data[i].ExecutablePath),
                  path:result.data[i].ExecutablePath,
                  env:result.data[i].AssociatedEnvironment,
                  type:result.data[i].EnvironmentType,
                  key:result.data[i].Did
                }]
              };

              tempData[item.key] = item;
            }
          }


          for (let key in tempData) {
            data.value.push(tempData[key]);
          }

        }else {
          notification.error({
            message: '提醒',
            description:'查询失败，原因：' + result.data
          })
        }
      })

      window.electronAPI.dbQuery(sql);
    }

    const delData = function (id){

      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk:() => {
          let sqls = [];
          sqls.push("DELETE FROM strategy_details WHERE StrategyID ='" + id + "'");
          sqls.push("DELETE FROM strategies WHERE ID ='" + id + "'");

          window.electronAPI.onDBExecComplete(function (result) {
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

          window.electronAPI.dbUpdate(sqls);
        }
      });

    }

    window.electronAPI.onEnvOptComplete(function (res) {

      reflash();

      if(res.retCode == 0){

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


    });

    const startup = (record) => {
      let recordStr = JSON.stringify(record)

      Modal.confirm({
        title: '启用',
        content: '确定启用吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk:() => {
          window.electronAPI.envStartup(recordStr);
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
          window.electronAPI.envShutdown(recordStr);
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
      shutdown
    };
  },
  name: "ControlPanel",
  components:{
    PlayCircleTwoTone,
    DeleteTwoTone,
    PauseCircleTwoTone,
    SyncOutlined
  }
})


</script>

<style scoped>

</style>