<template>
  <div ref="editorView" class="editorView">
    <v-tabs v-if="editorTabs.length" v-model="viewingEditor" show-arrows>
      <v-tabs-slider></v-tabs-slider>
      <v-tab v-for="oE in editorTabs" :key="'tab-'+oE.guiID" class="d-flex flex-column pl-2 pr-2">
        <div>{{ oE.name }}</div>
        <small>
          <div>{{oE.connName}}</div>
        </small>
      </v-tab>
    </v-tabs>
    <resize-observer @notify="handleResize" />
    <div id="monaco_container">
      <MonacoEditor ref="moancoEditorMain" @newEditorTab="newEditorTab" @runSQL="runSQL" :width="editorWidth" :height="editorHeight"></MonacoEditor>
    </div>
    <v-tabs-items v-model="viewingEditor" id="main_content">
      <v-tab-item v-for="oE in editorTabs" :key="'tab-'+oE.guiID">
        <!-- <MonacoEditor @runSQL="runSQL" :ref="'tab-'+oE.guiID+'-editor'" class="pa-1" ></MonacoEditor> -->
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import MonacoEditor from "@/components/monacoEditor.vue";
import { ipcRenderer } from 'electron';

@Component({
  components: {
    MonacoEditor
  }
})
export default class EditorTabs extends Vue {
  editor: any
  editorWidth: number | null
  editorHeight: number | null
  constructor() {
    super();
    this.editor = null
    this.editorWidth = 0
    this.editorHeight = 0
  }

  mounted () {
    this.editor = this.$refs['moancoEditorMain']
    const el = <HTMLElement>this.$refs['editorView']
    this.editorWidth = el.offsetWidth
    this.editorHeight = el.offsetHeight - 48
  }

  get editorTabs () {
    return this.$store.state.editorTabs
  }

  get viewingEditor () {
    return this.$store.state.viewingEditorTab
  }

  set viewingEditor (val) {
    this.$store.commit('viewingEditorTab', val)
  }

  get servers () {
    return this.$store.state.servers
  }

  newEditorTab () {
    const editor = this.$store.getters.getCurrentEditorTab
    const server = this.servers.find((d:any) => d.guiID === editor.serverGuiID)
    this.$store.commit('addEditorTab', server)
  }

  runSQL () {
    const editor = this.$store.getters.getCurrentEditorTab
    const server = this.servers.find((d:any) => d.guiID === editor.serverGuiID)
    const monaco = this.editor
    const query = monaco._getValue()
    const selectedText = monaco._getSelectedText()

    if (!query) return null
    ipcRenderer.send('server:runQuery', server.opts, editor.guiID, (selectedText || query))
  }

  handleResize (e: { width: number, height: number }) {
    // console.log('HIT')
    this.editorWidth = e.width
    this.editorHeight = e.height - 50
  }

  @Watch('viewingEditor')
  viewingEditorChange(val: any, oldVal: any) {
    const editor = this.editor._getEditor()
    const currentState = editor.saveViewState();
    const currentModel = editor.getModel();
    const currentValue = this.editor._getValue();
    if (oldVal === undefined || oldVal === null) oldVal = val // First load it will be null

    // save old tab state
    this.$store.commit('saveEditorTabContext', { tabIdx: oldVal, state: currentState, model: currentModel, value: currentValue})

    // get new tab
    const newEditorTab = this.$store.getters.getCurrentEditorTab

    // update editor
    if (newEditorTab.model) this.editor._setModel(newEditorTab.modelcurrentModel);
    else this.editor._newModel();
    this.editor._setValue(newEditorTab.value || '');
    if (newEditorTab.state) editor.restoreViewState(newEditorTab.state);

    // focus editor
		editor.focus();
  }
}
</script>

<style lang="scss" scoped>
.editorView {
  height: 100%;
}

#monaco_container {
  height: 100%;
  position: relative;
}

.monaco_editor_container {
  height: 100%;
}
</style>
