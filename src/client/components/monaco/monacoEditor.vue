<template>
  <div class="monaco_editor_container"></div>
</template>

<script lang="ts">
// import * as monaco from 'monaco-editor-core';
import monacoEditor, {initMonaco} from './monacoEditor'

import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class monacoEditorContainer extends Vue {
  mounted () {
    initMonaco('monaco_editor_container')

  }
}
</script>

<style lang="scss" scoped>
</style>
