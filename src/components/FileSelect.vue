<template>
  <div>
    <input type="file" @change="handleFileChange" :accept="accept" :multiple="multiple" ref="fileInput" style="display: none" />
    <button @click="openFileSelector">{{ buttonText }}</button>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    accept: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: 'Select Files'
    }
  },
  setup(props, { emit }) {
    const fileInputRef = ref(null);

    const openFileSelector = () => {
      fileInputRef.value.click();
    };

    const handleFileChange = (event) => {
      const files = event.target.files;
      if (files && files.length) {
        emit('fileChange', props.multiple ? files : files[0]);
      }
    };

    return {
      fileInputRef,
      openFileSelector,
      handleFileChange
    };
  }
});
</script>
