<template>
  <a-row>
    <a-col :span="20">
      <div id="tool-bar">
        <a-badge color="#87d068" text="EnvMaster" />
      </div>
    </a-col>
    <a-col :span="4">
      <div style="text-align: right;">
        <a-button type="link" @click="minimizeWin"><MinusOutlined /></a-button>
        <a-button type="link" @click="maximizeWin">
          <template v-if = "winStat == true">
            <BorderOutlined/>
          </template>
          <template v-else>
            <SwitcherOutlined />
          </template>
        </a-button>
        <a-button type="link" @click="closeWin"><CloseOutlined /></a-button>
      </div>
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="24">
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
    </a-col>
  </a-row>
</template>

<script>
import { defineComponent, ref} from 'vue';
import { SlidersOutlined, SearchOutlined, MinusOutlined, BorderOutlined, CloseOutlined,SwitcherOutlined} from '@ant-design/icons-vue';

import EnvScanner  from './components/EnvScanner.vue'
import ControlPanel  from './components/ControlPanel.vue'


export default defineComponent({
  setup(){

    let comName = ref('ControlPanel');

    const winStat = ref(true);

    const minimizeWin = ()=>{
      window.electronAPI.minimizeWin(); // 窗口最小化
    };

    const maximizeWin = ()=>{
      winStat.value = !winStat.value;
      window.electronAPI.maximizeWin();
    };

    const closeWin = ()=>{
      window.electronAPI.closeWin();
    };

    const handleClick = e => {
      if(e.key === 'control'){
        comName.value='ControlPanel';
      }else {
        comName.value='EnvScanner';
      }
    };
    return {
      comName,
      winStat,
      handleClick,
      minimizeWin,
      maximizeWin,
      closeWin
    }
  },
  name:'App',
  components:{
    EnvScanner,
    ControlPanel,
    SlidersOutlined,
    SearchOutlined,
    MinusOutlined,
    BorderOutlined,
    CloseOutlined,
    SwitcherOutlined
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

  #tool-bar{
    -webkit-app-region: drag; /* 此样式属性启用拖动 */
  }


</style>
