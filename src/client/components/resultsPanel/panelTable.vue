<template>
  <div>
    <div v-for="(result, idx) in currentResults(openEditor.guiID)" :key="openEditor.guiID+'-table-'+idx">
      <v-data-table v-if="Array.isArray(result)" :ref="openEditor.guiID+'-table-'+idx" :height="tableHeight / currentResults(openEditor.guiID).length" :fixed-header="true" :loading="openEditor.resultsPanelLoading" :headers="getEditorTabResultKeys(openEditor.guiID, idx)" :items="getEditorTabResults(openEditor.guiID, idx)" :items-per-page="15" :footer-props="{'items-per-page-options':[15, 30, 50, 75, 100, -1]}" dense :class="{'elevation-1': true, 'showing-scroll': showingScroll(openEditor.guiID+'-table-'+idx)}"></v-data-table>
      <div v-else class="pa-3" style="color: #fff">
        <p>{{ result.sqlMessage }}</p>
        <p v-show="result.affectedRows">Affected Rows: {{ result.affectedRows }}</p>
        <p v-show="result.localRanAt">Ran At: {{ result.localRanAt }}</p>
      </div>
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
    let results = !data.error ? data.recordsets : [data]

    if (results[0].affectedRows == 0) {
      results[0].localRanAt = data.localRanAt
      return results
    }

    return results
  }

  showingScroll (ref: string) {
    this.$nextTick(() => {
      const r = <any>this.$refs[ref];
      const target = Array.isArray(r) ? r[0] : r;

      if (target && target.$el.getElementsByTagName && target.$el.getElementsByTagName('table')[0].offsetWidth > target.$el.offsetWidth) {
        target.$el.getElementsByClassName('v-data-footer')[0].style.bottom = "9px"
      } else if (target && target.$el.getElementsByTagName) {
        target.$el.getElementsByClassName('v-data-footer')[0].style.bottom = "0px"
      }
    })

    return false
  }

  get getEditorTabResultKeys() {
    return (editorGuiID: string, idx: number) => {
      let tabResults = this.editorTabsResults[editorGuiID]
      if (tabResults && !tabResults.error && tabResults.recordsets) {
        return Object.keys(tabResults.recordsets[idx][0]).map(d => ({ text: d, value: d }))
      }

      return []
    }
  }

  get getEditorTabResults() {
    return (editorGuiID: string, idx: number) => {
      let tabResults = this.editorTabsResults[editorGuiID]

      if (tabResults && !tabResults.error && tabResults.recordsets) {
        return tabResults.recordsets[idx]
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
