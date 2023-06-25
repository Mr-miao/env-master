<template>
  <a-row>
    <a-col :span="6">
      <a-input-search
          placeholder="请输入扫描路径"
          enter-button="扫描"
          @search="scan"
      />
    </a-col>
    <a-col :span="18"></a-col>
  </a-row>
  <a-row><a-col :span="24">&nbsp;</a-col></a-row>
  <a-row>
    <a-col :span="24">
      <a-table
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :data-source="sanTableData"
          :columns="sanTableColumns"
      />
    </a-col>
  </a-row>
  <a-row justify="end">
    <a-col :span="24" align="right">
      <a-button type="primary">保存</a-button>
    </a-col>
  </a-row>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { uuid } from "vue-uuid";

const sanTableColumns = [{
  title:'名称',
  dataIndex:'name',
  key:'name'
},{
  title:'类型',
  dataIndex:'type',
  key:'type'
},{
  title:'路径',
  dataIndex:'path',
  key:'path'
}];



export default defineComponent({
  setup() {
    const sanTableData =ref([]);
    const scan = (value) =>{
      console.log(value);
      window.electronAPI.scan(value, (execFile) => {
        sanTableData.value.push({
          "key":uuid.v1(),
          "name":execFile.name,
          "type":execFile.type,
          "path":execFile.path,
          "children":execFile.children
        });
        // console.log(sanTableData);
      });
    }
    return {
      sanTableColumns,
      sanTableData,
      scan};
  },
  name: "EnvScanner"
})
</script>

<style scoped>

</style>