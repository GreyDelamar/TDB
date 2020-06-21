<template>
  <div id="monaco_editor_container" class="monaco_editor_container"></div>
</template>

<script lang="ts">
import * as monaco from 'monaco-editor';
import { monacoBootstrap } from './monacoEditor'

import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class monacoEditorContainer extends Vue {
  editor: any
  monaco: any

  mounted () {
    this.editor = new monacoBootstrap('monaco_editor_container')
    this.monaco = this.editor.editor
    this.defaultHotkeys()
  }

  defaultHotkeys () {
    const $self = this;

    $self.monaco.addAction({
      id: "run-sql-formatter",
      label: "Run SQL Formatter",
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_B,
          NaN
        )
      ],
      contextMenuGroupId: "navigation",
      run() {
        $self.monaco.getAction("editor.action.formatDocument").run();
        return "";
      }
    });

    $self.monaco.addAction({
      id: "toggle-results-panel",
      label: "Toggle Results Panel",
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.US_BACKTICK,
          NaN
        )
      ],
      contextMenuGroupId: "navigation",
      run() {
        $self.$store.commit('saveEditorTabContext', { tabIdx: $self.$store.state.viewingEditorTab, showResultsPanel: 'toggle' })
        return true;
      }
    });

    $self.monaco.addAction({
      id: "run-sql",
      label: "Run SQL",
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
          NaN
        ),
        monaco.KeyCode.F5
      ],
      contextMenuGroupId: "navigation",
      run() {
        const selectedText = $self.monaco.getModel().getValueInRange($self.monaco.getSelection())
        const query = selectedText || $self.monaco.getValue()
        $self.$emit("runSQL", query)
        return true;
      }
    });

    $self.monaco.addAction({
      id: "new-editor-tab",
      label: "New Editor Tab",
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_T,
          NaN
        )
      ],
      contextMenuGroupId: "navigation",
      run() {
        $self.$emit("newEditorTab")
        return true;
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.monaco_editor_container {
  height: calc(100% - 48px) !important;
}
</style>
