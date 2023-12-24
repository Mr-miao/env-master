<template>
  <a-card v-if="readonly == false" :title="title" size="small">
    <template #extra>
      <a-tooltip placement="topRight">
        <template #title>
          <span>{{ switchTip }}</span>
        </template>
        <a-switch :checked="switched" @change="switchChanged"/>
      </a-tooltip>
    </template>
    <v-ace-editor
        v-model:value="scriptContent"
        lang="batchfile"
        theme="github"
        :readonly="readonly"
        :maxLines="maxLines"
        :minLines="minLines"
        :printMargin="false"
        :wrap="true"
        @input="scriptInput"/>
  </a-card>
  <a-card v-else :title="title" size="small">
    <template #extra>
      <span>{{ switchTip }}</span>
    </template>
    <v-ace-editor
        v-model:value="scriptContent"
        lang="batchfile"
        theme="github"
        :maxLines="maxLines"
        :minLines="minLines"
        :readonly=true
        :printMargin="false"
        :wrap="true"/>
  </a-card>
</template>

<script>
import {ref} from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import './ace.config'

export default{
  props: {
    readonly: {type:Boolean,
      default:false
    },
    maxLines:{
      type:Number,
      default:20
    },
    minLines :{
      type:Number,
      default:20
    },
    title:String,
    switchOnTip:String,
    switchOffTip:String,
    script:String,
    switched: {type:Boolean,
      default:false
    },
  },
  emits: ['update:script','update:switched'],

  components:{
    VAceEditor
  },

  watch:{
    script(newScript){
      this.scriptContent = newScript;
    }
  },

  setup (props, { emit }){
    const switchTip = ref(props.switchOffTip);
    const scriptContent = ref('');
    const scriptInput = () =>{
      emit('update:script', scriptContent)
    }

    const switchChanged = (checked) =>{
      // props.switched = checked
      emit('update:switched', checked)
      if(checked){
        switchTip.value = props.switchOnTip;
      }else{
        switchTip.value = props.switchOffTip;
      }
    }

    return{
      switchTip,
      scriptContent,
      switchChanged,
      scriptInput
    }
  },

  name: "ScriptEditor"
}
</script>

<style scoped>

</style>