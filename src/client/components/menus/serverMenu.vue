<template>
  <v-navigation-drawer width="calc(100% - 72px)" permanent>
    <ServerSearch :search.sync="searchVal" />
    <ServerTree :searchTerm="searchVal" />
    <resize-observer @notify="handleResize" />
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ServerSearch from "@/components/menus/serverSearch.vue";
import ServerTree from "@/components/menus/serverTree.vue";

@Component({
  components: {
    ServerTree,
    ServerSearch
  }
})
export default class serverMenu extends Vue {
  searchVal = ''

  get mainViewHeight () {
    return this.$store.state.mainViewHeight
  }

  set mainViewHeight (val) {
    this.$store.commit('mainViewHeight', val)
  }

  get mainNavWidth () {
    return this.$store.state.mainNavWidth
  }

  set mainNavWidth (val) {
    this.$store.commit('mainNavWidth', val)
  }

  handleResize (e: { width: number, height: number }) {
    this.mainViewHeight = e.height;
    this.mainNavWidth = e.width;
  };
}
</script>
