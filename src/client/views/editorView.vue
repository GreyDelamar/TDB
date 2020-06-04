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
    <div id="monaco_container">
      <MonacoEditor ref="moancoEditorMain" @newEditorTab="newEditorTab" @runSQL="runSQL" :width="editorWidth" :height="editorHeight"></MonacoEditor>
      <v-tabs-items v-model="viewingEditor" class="results-panel">
        <v-tab-item v-for="oE in editorTabs" :key="'tab-'+oE.guiID">
          <v-data-table :headers="getEditorTabResultKeys(oE.guiID)" :items="getEditorTabResults(oE.guiID)" :items-per-page="5" dense class="elevation-1"></v-data-table>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import MonacoEditor from "@/components/monacoEditor.vue";
import { Component, Vue, Watch } from "vue-property-decorator";

@Component({
  components: {
    MonacoEditor
  }
})
export default class EditorTabs extends Vue {
  editor: any
  editorWidth: number | null
  editorHeight: number | null
  columns = []
  constructor() {
    super();
    this.editor = null
    this.editorWidth = 0
    this.editorHeight = 0
  }

  mounted () {
    ipcRenderer.on('server:runQuery:result', this.handleQueryResults)
    this.editor = this.$refs['moancoEditorMain']
    this.$nextTick(() => {
      const el = <HTMLElement>this.$refs['editorView']
      this.editorWidth = el.offsetWidth
      this.editorHeight = el.offsetHeight - 48
    })
  }

  beforeDestroy () {
    ipcRenderer.removeListener('server:runQuery:result', this.handleQueryResults)
  };

  handleQueryResults (e:any, data: any) {
    if (!data.error) {
      console.log('Got results')
      this.$store.commit('editorTabsResults', data)
    } else {
      console.log('Something went wrong')
      console.log(data.error)
    }
  };

  get getEditorTabResultKeys() {
    return (editorGuiID: string) => {
      if(this.editorTabsResults[editorGuiID]) {
        return Object.keys(this.editorTabsResults[editorGuiID].recordset[0]).map(d => ({ text: d, value: d }))
      }

      return []
    }
  }

  get getEditorTabResults() {
    return (editorGuiID: string) => {
      if(this.editorTabsResults[editorGuiID]) {
        let results = this.editorTabsResults[editorGuiID].recordset
        console.log(results)
        return results
      }

      return []
    }
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

  get mainViewHeight () {
    return this.$store.getters.mainViewHeight
  }

  get mainViewWidth () {
    return this.$store.getters.mainViewWidth
  }

  get editorTabsResults () {
    return this.$store.getters.editorTabsResults
  }

  @Watch('editorTabsResults', { deep: true })
  editorTabsResultsChange () {
    this.$store.getters.getCurrentEditorResults //- records
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

  @Watch('viewingEditor')
  viewingEditorChange(val: any, oldVal: any) {
    const editor = this.editor._getEditor()
    const currentState = editor.saveViewState();
    const currentModel = editor.getModel();
    const currentValue = this.editor._getValue();
    if (oldVal === undefined || oldVal === null) oldVal = val // First load it will be null

    // save old tab state
    this.$store.commit('saveEditorTabContext', { tabIdx: oldVal, state: currentState, value: currentValue})

    // get new tab
    const newEditorTab = this.$store.getters.getCurrentEditorTab

    // update editor
    // if (newEditorTab.model) this.editor._setModel(newEditorTab.modelcurrentModel);
    // else this.editor._newModel();
    this.editor._setValue(newEditorTab.value || '');
    if (newEditorTab.state) editor.restoreViewState(newEditorTab.state);

    // focus editor
		editor.focus();
  }

  @Watch('mainViewHeight')
  mainViewHeightChange(val: any) {
    // minus 50px for the tabs
    this.editorHeight = val - 50
  }

  @Watch('mainViewWidth')
  mainViewWidthChange(val: any) {
    // minus 50px for the tabs
    this.editorWidth = val
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
  position: relative;
}

.results-panel {
  position: absolute;
  bottom: 50px !important;
  width: 100%;
  top: unset;
  bottom: 50px;
  height: auto !important;
}
</style>
