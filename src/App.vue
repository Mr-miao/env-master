<template>
  <a-row>
    <a-col :span="5">
      <a-badge color="#87d068" text="EnvMaster" />
      &nbsp;
      <a-tag color="processing">
        <template #icon>
          <ExclamationCircleFilled />
        </template>
        Beta_v_{{ version }}
      </a-tag>
    </a-col>
    <a-col :span="13">
      <div id="tool-bar">&nbsp;</div>
    </a-col>
    <a-col :span="6">
      <div style="text-align: right;">
        <a-button type="link" @click="minimizeWin"><MinusOutlined /></a-button>
        <a-button type="link" @click="maximizeWin">
          <template v-if = "isWinMaximize == false">
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
import { ExclamationCircleFilled, SlidersOutlined, SearchOutlined, MinusOutlined, BorderOutlined, CloseOutlined,SwitcherOutlined} from '@ant-design/icons-vue';

import EnvScanner  from './components/EnvScanner.vue'
import ControlPanel  from './components/ControlPanel.vue'

const listenerEnums = require("@/electron/handlers/enum");


export default defineComponent({
  setup(){

    let comName = ref('ControlPanel');

    //
    const isWinMaximize = ref(false);

    const minimizeWin = ()=>{
      window.electronAPI.call(listenerEnums.MSG_MINIMIZE_WIN); // 窗口最小化
    };

    const maximizeWin = ()=>{
      isWinMaximize.value = !isWinMaximize.value;
      window.electronAPI.call(listenerEnums.MSG_MAXIMIZE_WIN);
    };

    const closeWin = ()=>{
      window.electronAPI.call(listenerEnums.MSG_CLOSE_WIN);
    };

    //接收双击标题栏带来的窗口变化事件
    window.electronAPI.on(listenerEnums.MSG_WIN_STAT_CHANGE, (winStat) => {
      isWinMaximize.value = winStat;
    });

    const handleClick = e => {
      if(e.key === 'control'){
        comName.value='ControlPanel';
      }else {
        comName.value='EnvScanner';
      }
    };
    return {
      comName,
      isWinMaximize,
      handleClick,
      minimizeWin,
      maximizeWin,
      closeWin,
      version: process.env.VUE_APP_VERSION || 'unknown'
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
    SwitcherOutlined,
    ExclamationCircleFilled
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
