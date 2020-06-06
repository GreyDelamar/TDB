<template>
  <div>
    <div v-for="(result, idx) in currentResults(openEditor.guiID)" :key="openEditor.guiID+'table'+idx">
      <v-data-table :height="tableHeight / currentResults(openEditor.guiID).length" :fixed-header="true" :loading="openEditor.resultsPanelLoading" :headers="getEditorTabResultKeys(openEditor.guiID, idx)" :items="getEditorTabResults(openEditor.guiID, idx)" :items-per-page="15" :footer-props="{'items-per-page-options':[15, 30, 50, 75, 100, -1]}" dense class="elevation-1"></v-data-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  props: {
    openEditor: Object,
    tableHeight: Number
  }
})
export default class ResultsPanelTable extends Vue {
  get editorTabsResults () {
    return this.$store.getters.editorTabsResults
  }

  currentResults (editorGuiID: string) {
    let data = this.editorTabsResults[editorGuiID] || {}
    return data.recordsets || []
  }

  get getEditorTabResultKeys() {
    return (editorGuiID: string, idx: number) => {
      if(this.editorTabsResults[editorGuiID]) {
        return Object.keys(this.editorTabsResults[editorGuiID].recordsets[idx][0]).map(d => ({ text: d, value: d }))
      }

      return []
    }
  }

  get getEditorTabResults() {
    return (editorGuiID: string, idx: number) => {
      if(this.editorTabsResults[editorGuiID]) {
        let results = this.editorTabsResults[editorGuiID].recordsets[idx]
        return results
      }

      return []
    }
  }
}
</script>

<style lang="scss" scoped>
  .panel-actions {
    background-color: #343434;
    height: 30px;
  }
  .v-icon.v-icon {
    width: 23px;
  }
</style>
