<template>
  <div ref="editorView" id="editorView" class="editorView" v-show="editorTabs.length">
    <v-tabs v-model="viewingEditor" show-arrows>
      <v-tabs-slider></v-tabs-slider>
      <v-tab v-for="oE in editorTabs" :key="'tab-'+oE.guiID" class="d-flex flex-column pl-2 pr-2">
        <div class="d-flex">
          <div>
            <div>
              {{ oE.name }}
            </div>
            <small>
              <div>{{oE.connName}}</div>
            </small>
          </div>
          <div class="ml-3 d-flex flex-column justify-center">
            <v-icon @click="exitEditor(oE.guiID)">fa-times</v-icon>
          </div>
        </div>
      </v-tab>
    </v-tabs>
    <div id="monaco_container">
      <MonacoEditor ref="moancoEditorMain" @newEditorTab="newEditorTab" @runSQL="runSQL" @saveFile="saveFile"></MonacoEditor>
      <v-tabs-items v-model="viewingEditor" class="results-panel">
        <v-tab-item v-for="oE in editorTabs" :key="'tab-'+oE.guiID">
          <ResultsPanelView :show="oE.showResultsPanel" :openEditor="oE" :editorHeight="editorHeight"/>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import { Component, Vue, Watch } from "vue-property-decorator";

import MonacoEditor from "@/components/monaco/monacoEditor.vue";
import ResultsPanelView from "@/components/resultsPanel/panelView.vue";

@Component({
  components: {
    MonacoEditor,
    ResultsPanelView
  }
})
export default class EditorTabs extends Vue {
  editor: any
  editorHeight: number | null

  constructor() {
    super();
    this.editor = null
    this.editorHeight = 0
  }

  mounted () {
    ipcRenderer.on('server:runQuery:result', this.handleQueryResults)
    ipcRenderer.on('showOpenDialog:result', this.openFiles)
    ipcRenderer.on('showSaveDialog:result', this.savedFile)

    this.editor = this.$refs['moancoEditorMain']

    this.$nextTick(() => {
      const el = <HTMLElement>this.$refs['editorView']
      this.editorHeight = el.offsetHeight - 48

      el.ondragover = () => {
        return false;
      };

      el.ondrop = (e) => {
        e.preventDefault();
        let files:Array<loadedFile> = []

        if (e.dataTransfer !== null) {
          for (let f of e.dataTransfer.files) {
            files.push({ filePath: f.path, fileName: f.name, fileContent: "" })
          }

          ipcRenderer.send('draggedFiles', files)
        }


        return false;
      };
    })

  }

  beforeDestroy () {
    ipcRenderer.removeListener('server:runQuery:result', this.handleQueryResults)
  };

  openFiles (e: any, data: Array<loadedFile>) {
    for (let i = 0; i < data.length; i++) {
      const file = data[i];
      this.newEditorTab(file)
    }
  }

  handleQueryResults (e:any, data: any) {
    if (!data.error) {
      console.log('Got results')
      this.$store.commit('editorTabsResults', data)
    } else {
      console.log('Something went wrong')
      console.log(data.error)
    }
  };

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

  get currentEditorTab () {
    return this.$store.getters.getCurrentEditorTab
  }

  saveFile () {
    const editor = this.editor.monaco
    const state = editor.saveViewState()
    const value = editor.getValue()
    const filePath = this.currentEditorTab.filePath
    const guiID = this.currentEditorTab.guiID

    this.$store.commit('saveEditorTabContext', { state: state, value: value })

    ipcRenderer.send('showSaveDialog', { value, filePath, guiID })
  }

  savedFile (e: any, data: any) {
    if (data.saved) this.$store.commit('saveEditorTabContext', { filePath: data.filePath, guiID: data.guiID, name: data.fileName })
    else console.log(data.error)
  }

  newEditorTab (file?: loadedFile) {
    const editor = this.currentEditorTab
    const server = this.servers.find((d:any) => d.guiID === editor.serverGuiID)
    if (file) {
      this.$store.commit('loadFileAddTab', { file, server })
      if (this.viewingEditor > (this.editorTabs.length -1)) this.viewingEditorChange(this.editorTabs.length -1, null)
    } else {
      this.$store.commit('addEditorTab', server)
    }
  }

  runSQL (query: string) {
    const editor = this.currentEditorTab
    const server = this.servers.find((d:any) => d.guiID === editor.serverGuiID)

    this.$store.commit('saveEditorTabContext', { tabIdx: this.viewingEditor, showResultsPanel: true, resultsPanelLoading: true})

    if (!query) return null

    // this will track query history
    let history = {...server.opts, ...{ query, createdAt: new Date() }}
    delete history.password;
    this.$store.dispatch('history/set', history)

    ipcRenderer.send('server:runQuery', server.opts, editor.guiID, query)
  }

  exitEditor(guiID: string) {
    this.$store.commit('removeEditorTab', guiID)
  }

  @Watch('viewingEditor')
  viewingEditorChange(val: any, oldVal: any) {

    const editor = this.editor.monaco
    const currentState = editor.saveViewState();
    const currentModel = editor.getModel();
    const currentValue = editor.getValue();

    // First load it will be null
    if (oldVal === undefined || oldVal === null)
      oldVal = val

    // save old tab state
    if (val !== undefined)
      this.$store.commit('saveEditorTabContext', { tabIdx: oldVal, state: currentState, value: currentValue})

    // get new tab
    const newEditorTab = this.currentEditorTab

    // update editor state & value
    editor.setValue(newEditorTab.value || '');

    if (newEditorTab.state)
      editor.restoreViewState(newEditorTab.state);

    // focus editor
		editor.focus();
  }

}
</script>

<style lang="scss" scoped>

.editorView {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.monaco_editor_container {
  height: 100%;
  position: relative;
}

</style>
