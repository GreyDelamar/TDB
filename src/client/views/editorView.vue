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
          <v-data-table :headers="headers" :items="desserts" :items-per-page="1000" class="elevation-1"></v-data-table>
        </v-tab-item>
      </v-tabs-items>
    </div>
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
          headers= [
          {
            text: 'Dessert (100g serving)',
            align: 'start',
            sortable: false,
            value: 'name',
          },
          { text: 'Calories', value: 'calories' },
          { text: 'Fat (g)', value: 'fat' },
          { text: 'Carbs (g)', value: 'carbs' },
          { text: 'Protein (g)', value: 'protein' },
          { text: 'Iron (%)', value: 'iron' },
        ]
        desserts= [
          {
            name: 'Frozen Yogurt',
            calories: 159,
            fat: 6.0,
            carbs: 24,
            protein: 4.0,
            iron: '1%',
          },
          {
            name: 'Ice cream sandwich',
            calories: 237,
            fat: 9.0,
            carbs: 37,
            protein: 4.3,
            iron: '1%',
          }
        ]
  constructor() {
    super();
    this.editor = null
    this.editorWidth = 0
    this.editorHeight = 0
  }

  mounted () {
    this.$nextTick(() => {
      this.editor = this.$refs['moancoEditorMain']
      const el = <HTMLElement>this.$refs['editorView']
      this.editorWidth = el.offsetWidth
      this.editorHeight = el.offsetHeight - 48
    })
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
  top: 1px;
  width: 100%;
  top: unset;
  bottom: 50px;
  height: auto;
}
</style>
