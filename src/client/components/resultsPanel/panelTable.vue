<template>
  <v-data-table :height="tableHeight" :fixed-header="true" :loading="openEditor.resultsPanelLoading" :headers="getEditorTabResultKeys(openEditor.guiID)" :items="getEditorTabResults(openEditor.guiID)" :items-per-page="5" dense class="elevation-1"></v-data-table>
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
