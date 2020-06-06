<template>

  <div class="panel-actions d-flex justify-end pa-1 pr-3 pl-3">
    <!-- Min/Max buttons -->
    <v-tooltip top v-if="!panelToggled">
      <template v-slot:activator="{ on }">
        <v-icon @click.stop="$emit('togglePanel', true)" v-on="on" class="mr-5">fa-window-maximize</v-icon>
      </template>
      <span style="text-transform: capitalize;">Maximize Panel</span>
    </v-tooltip>
    <v-tooltip top v-else>
      <template v-slot:activator="{ on }">
        <v-icon @click.stop="$emit('togglePanel', false)" v-on="on" class="mr-5 fa-inverse">fa-window-minimize</v-icon>
      </template>
      <span style="text-transform: capitalize;">Minimize Panel</span>
    </v-tooltip>

    <!-- Exit button -->
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-icon @click.stop="$emit('exitPanel')" v-on="on">fa-times</v-icon>
      </template>
      <span style="text-transform: capitalize;">Exit Panel</span>
    </v-tooltip>
  </div>

</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  props: {
    panelToggled: Boolean
  }
})
export default class resultsPanelActions extends Vue {}
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
