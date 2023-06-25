<template>
  <a-menu mode="horizontal" @click="handleClick">
    <a-menu-item key="control">
      <template #icon>
        <sliders-outlined />
      </template>
      控制面板
    </a-menu-item>
    <a-menu-item key="scan">
      <template #icon>
        <search-outlined />
      </template>
      扫描仪
    </a-menu-item>
  </a-menu>

  <a-layout class="evn-layout">
    <component :is="comName"></component>
  </a-layout>
</template>

<script>
import { defineComponent, ref} from 'vue';
import { SlidersOutlined, SearchOutlined} from '@ant-design/icons-vue';

import EnvScanner  from './components/EnvScanner.vue'
import ControlPanel  from './components/ControlPanel.vue'

export default defineComponent({
  setup(){

    let comName = ref('ControlPanel');

    const handleClick = e => {
      if(e.key === 'control'){
        comName.value='ControlPanel';
      }else {
        comName.value='EnvScanner';
      }
    };
    return {
      comName,
      handleClick
    }
  },
  name:'App',
  components:{
    EnvScanner,
    ControlPanel,
    SlidersOutlined,
    SearchOutlined
  }
});
</script>

<style>
  body,html {
    height: 100%;
    padding: 5px 5px 5px 5px;
  }

  .evn-layout{
    padding: 10px 10px 10px 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    background-color: white;
  }
</style>
