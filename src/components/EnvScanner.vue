<template>
  <a-row>
    <a-col :span="6">
      <a-input-search
          allowClear
          placeholder="请输入扫描路径"
          enter-button="扫描"
          @search="scan"
          :loading = "loadingStat"
      />
    </a-col>

    <a-col :span="18">
      <a-divider type="vertical" />
      <a-button :disabled="btnDisableStat" @click="showModal('new')">新建策略</a-button>
      <a-divider type="vertical" />
      <a-button :disabled="btnDisableStat" @click="showModal('saveto')">保存到现有策略</a-button>
    </a-col>
  </a-row>
  <a-row><a-col :span="24">&nbsp;</a-col></a-row>
  <a-row>
    <a-col :span="24">
      <a-table
          :row-selection="{ onChange: onSelectChange}"
          :data-source="sanTableData"
          :columns="sanTableColumns"
      />
    </a-col>
  </a-row>

  <a-modal title="新建策略" v-model:visible="isStrategyModalVisible" @cancel="closeModal">
    <a-form
        :model="strategyInfo"
        ref="newFormRef"
        name="basic"
        autocomplete="off">
      <a-form-item
          label="策略名称"
          name="strategyName"
          :rules="[{ required: true, message: '请输入策略名称' }]">
        <a-input v-model:value="strategyInfo.strategyName" placeholder="请输入策略名称" style="margin-bottom: 10px;" />
      </a-form-item>
      <a-form-item
          label="策略描述"
          name="strategyDescription"
          :rules="[{ required: true, message: '请输入策略描述' }]">
        <a-textarea v-model:value="strategyInfo.strategyDescription" placeholder="请输入策略描述" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleNew">确定</a-button>
    </template>
  </a-modal>

  <a-modal title="保存到现有策略" v-model:visible="isSavetoModalVisible" @cancel="closeModal">
    <a-form
        :model="strategyInfo"
        ref="savetoFormRef"
        name="basic"
        autocomplete="off">
      <a-form-item
          label="策略名称"
          name="strategyKey"
          :rules="[{ required: true, message: '请选择策略名称' }]">
        <a-select
            v-model:value="strategyInfo.strategyKey"
            :options="strategyInfoList"
            show-search
            placeholder="选择策略名称"

        ></a-select>
      </a-form-item>

    </a-form>
    <template #footer>
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleSaveto">确定</a-button>
    </template>
  </a-modal>




</template>

<script>
import { defineComponent, ref } from 'vue';
import { notification } from 'ant-design-vue';
// import { uuid } from "vue-uuid";
import until from "../comm/until"



const sanTableColumns = [{
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
  title:'备注',
  dataIndex:'comment',
  key:'comment'
}];

let tableSelectedRows = [];

export default defineComponent({
  setup() {
    // console.log(loadingStat);
    //扫描结果表格数据
    const sanTableData =ref([]);
    //扫描按钮加载状态控制变量
    const loadingStat = ref(false);
    //策略新增按钮状态控制变量
    const btnDisableStat = ref(true);
    //新增策略模态窗口可见状态控制变量
    const isStrategyModalVisible = ref(false);
    //保存到现有策略模态窗口可见状态控制变量
    const isSavetoModalVisible = ref(false);

    //保存到现有策略模态窗口策略信息
    const strategyInfoList = ref([]);
    const selectedStrategy = ref('');

    //form引用
    const newFormRef = ref();
    const savetoFormRef = ref();

    //模态窗口策略信息
    const strategyInfo = ref({
      strategyKey : '',
      strategyName : '',
      strategyDescription : ''
    });



    //注册扫描完成后的事件处理回调函数
    window.electronAPI.onScanComplete(() => {
      loadingStat.value = false;
    })
    //注册扫描中监听返回的事件处理函数
    window.electronAPI.onScaning((sanRes) => {
      // console.log(sanRes)
      for (let i = 0; i < sanRes.length; i++) {
        sanTableData.value.push(sanRes[i]);
      }


    });

    //搜索按钮的处理事件
    const scan = (value) =>{
      //开始扫描
      if(value != undefined && value != ''){
        //清空数组
        sanTableData.value.length = 0;

        loadingStat.value = true;
        window.electronAPI.scan(value);
      }

    }

    const onSelectChange = (selectedRowKeys, selectedRows) =>{
      //如果加载状态未消失，不能开放创建策略的按钮
      if(loadingStat.value == true){
        return
      }

      tableSelectedRows = selectedRows;
      if(selectedRows.length > 0){
        btnDisableStat.value = false;
      }else {
        btnDisableStat.value = true;
      }
    }

    const showModal = (type) => {
      if(type == 'new'){
        isStrategyModalVisible.value = true;
      }else {
        let querySql = 'SELECT * FROM strategies;';

        //数据库脚本执行成功事件
        window.electronAPI.onDBExecComplete(function (result) {
          if(result.ret == 0){

            //将查询结果转存到下拉选择器中
            for (let i = 0; i < result.data.length; i++) {
              let item = {
                value: result.data[i].ID,
                label: result.data[i].StartegiesName
              };
              strategyInfoList.value.push(item);
            }

          }else {
            notification.error({
              message: '提醒',
              description:'查询失败，原因：' + result.data
            })
          }
        })

        window.electronAPI.dbQuery(querySql);

        isSavetoModalVisible.value = true;
      }
    }

    const closeModal = () =>{
      isSavetoModalVisible.value = false;
      isStrategyModalVisible.value = false;
      // 清空输入框的内容
      strategyInfo.value.strategyName = '';
      strategyInfo.value.strategyDescription = '';
      strategyInfoList.value = [];
    }


    const handleNew = () =>{
      newFormRef.value.validateFields().then(values => {

        let insertSql = new Array();
        let strategieKey = until.getUUID();

        insertSql.push('INSERT INTO strategies(ID, StartegiesName, Description, State) VALUES("'
            + strategieKey + '","'
            + values.strategyName + '","'
            + values.strategyDescription + '","'
            + 'down"' +
            ')'
        );

        // console.log(tableSelectedRows)

        for (let i = 0; i < tableSelectedRows.length; i++) {
          let row = tableSelectedRows[i];

          insertSql.push('INSERT INTO strategy_details(ID, StrategyID, AssociatedEnvironment, EnvironmentType, ExecutablePath, EnvironmentExecDetial) VALUES("'
              + until.getUUID() + '","'
              + strategieKey + '","'
              + row.env + '","'
              + row.type + '","'
              + row.path + '","'
              + row.comment +
              '")'
          );
        }
        // console.log(insertSql);

        //数据库脚本执行成功事件
        window.electronAPI.onDBExecComplete(function (result) {
          if(result.ret == 0){
            notification.success({
              message: '提醒',
              description:'保存成功'
            })
            // 关闭弹出窗口
            closeModal();
          }else {
            notification.error({
              message: '提醒',
              description:'保存失败，原因：' + result.data
            })
          }
        });

        window.electronAPI.dbUpdate(insertSql);



      }).catch(info => {
        console.log('Validate Failed:', info);
      });


    }

    const handleSaveto = () =>{
      savetoFormRef.value.validateFields().then(values => {

        let insertSql = new Array();

        for (let i = 0; i < tableSelectedRows.length; i++) {
          let row = tableSelectedRows[i];

          insertSql.push('INSERT INTO strategy_details(ID, StrategyID, AssociatedEnvironment, EnvironmentType, ExecutablePath, EnvironmentExecDetial) VALUES("'
              + until.getUUID() + '","'
              + values.strategyKey + '","'
              + row.env + '","'
              + row.type + '","'
              + row.path + '","'
              + row.comment +
              '")'
          );
        }

        //数据库脚本执行成功事件
        window.electronAPI.onDBExecComplete(function (result) {
          if(result.ret == 0){
            notification.success({
              message: '提醒',
              description:'保存成功'
            })
            // 关闭弹出窗口
            closeModal();
          }else {
            notification.error({
              message: '提醒',
              description:'保存失败，原因：' + result.data
            })
          }
        });

        window.electronAPI.dbUpdate(insertSql);



      }).catch(info => {
        console.log('Validate Failed:', info);
      });
    }

    return {
      isStrategyModalVisible,
      isSavetoModalVisible,
      strategyInfo,
      sanTableColumns,
      sanTableData,
      loadingStat,
      btnDisableStat,
      strategyInfoList,
      selectedStrategy,
      newFormRef,
      savetoFormRef,
      showModal,
      closeModal,
      handleNew,
      handleSaveto,
      scan,
      onSelectChange};
  },
  name: "EnvScanner"
})
</script>

<style scoped>

</style>