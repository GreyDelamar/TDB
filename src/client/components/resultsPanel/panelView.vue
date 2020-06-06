<template>
  <div class="inner-panel" v-if="show" :style="{ height: openEditor.minMaxResultsPanel ? editorHeight+'px' : resultsPanelHeight(openEditor.resultsPanelHeight), 'max-height': editorHeight+'px' }">
    <keep-alive>
      <PanelActions :panelToggled="openEditor.minMaxResultsPanel" />
    </keep-alive>

    <keep-alive>
      <panelTable :openEditor="openEditor" :tableHeight="openEditor.minMaxResultsPanel ? (editorHeight - 30) : tableHeight(openEditor.resultsPanelHeight)"/>
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import PanelActions from "./panelActions.vue";
import panelTable from "./panelTable.vue";

@Component({
  props: {
    show: Boolean,
    openEditor: Object,
    editorHeight: Number
  },
  components: {
    PanelActions,
    panelTable
  }
})
export default class ResultsPanelView extends Vue {
  tableHeight (resultsPanelHeight: number) {
    // - 89 is header/footer height of the table
    return (resultsPanelHeight ? resultsPanelHeight : 350 ) - 30
  }
  resultsPanelHeight (resultsPanelHeight: number | undefined) {
    return resultsPanelHeight ? resultsPanelHeight+'px' : '350px'
  }
}
</script>

<style lang="scss">
  .results-panel {
    .inner-panel {
      position: relative;

      .v-data-table {
        .v-data-table__wrapper {
          padding-bottom: 59px;
        }

        .v-data-footer {
          background-color: #232323;
          position: absolute;
          bottom: 0;
          left: 0;
          right: -7px;
        }
      }
    }
  }
</style>
