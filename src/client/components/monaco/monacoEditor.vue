<template>
  <div class="monaco_resize">
    <resize-observer @notify="handleResizeWidth" />

    <div id="monaco_editor_container" class="monaco_editor_container">
    </div>
  </div>
</template>

<script lang="ts">
import * as monaco from 'monaco-editor';
import { monacoBootstrap } from './monacoEditor'

import { Component, Vue, Watch } from "vue-property-decorator";

@Component({})
export default class monacoEditorContainer extends Vue {
  editor: any
  monaco: any

  mounted () {
    this.editor = new monacoBootstrap('monaco_editor_container', this.$store.getters.getCurrentEditorTab)
    this.monaco = this.editor.editor
    this.defaultHotkeys();

    // Listen for the toolbar runSQL btn
    this.$root.$on('runSQL', this.emitRunSql);
    this.monaco.onDidChangeModelContent(() => {
      const value = this.monaco.getValue();
      this.$store.commit('saveEditorTabContext', { value, temporary: false })
    });

    this.$nextTick(() => {
      this.monaco.layout();
    })
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
        $self.emitRunSql()
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

    $self.monaco.addAction({
      id: "save-editor-tab",
      label: "Save File",
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
          NaN
        )
      ],
      contextMenuGroupId: "navigation",
      run() {
        $self.$emit("saveFile")
        return true;
      }
    });
  };

  emitRunSql () {
    const $self = this
    const selectedText = $self.monaco.getModel().getValueInRange($self.monaco.getSelection())
    const query = selectedText || $self.monaco.getValue()
    $self.$emit("runSQL", query)
  }

  handleResizeWidth (e: { width: number, height: number }) {
    this.monaco.layout();
  };

  get editorTabs () {
    return this.$store.state.editorTabs
  }

  @Watch('editorTabs')
  editorTabWatcher (val: any, oldVal: any) {
    const editorTab = this.$store.getters.getCurrentEditorTab
    const nVal = val.find((d: any) => d.guiID === editorTab.guiID)
    const oVal = oldVal.find((d: any) => d.guiID === editorTab.guiID)

    this.monaco.setValue(nVal.value || '');
    this.monaco.restoreViewState(nVal.state);
  }

}
</script>

<style lang="scss">
#monaco_container {
  height: 100%;
  max-height: calc(100vh - 112px);
}

.monaco_resize {
  height: 100%;
  position: relative;
}

.monaco_editor_container {
  height: 100%;
}
</style>
