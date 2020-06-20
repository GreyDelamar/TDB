<template>
  <div id="monaco_editor_container" class="monaco_editor_container"></div>
</template>

<script lang="ts">
// import * as monaco from 'monaco-editor-core';
import { monacoBootstrap } from './monacoEditor'

import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class monacoEditorContainer extends Vue {
  editor: any

  mounted () {
    this.editor = new monacoBootstrap('monaco_editor_container')
  }
}
</script>

<style lang="scss" scoped>
.monaco_editor_container {
  height: 100%;
}
</style>
