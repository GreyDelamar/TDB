<template>
  <v-navigation-drawer width="calc(100% - 72px)" permanent>
    <MenuSearch :search.sync="searchVal" placeholder="Search Connections"/>
    <ServerTree :searchTerm="searchVal" />
    <resize-observer @notify="handleResize" />
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import MenuSearch from "@/components/mainDrawer/menuSearch.vue";
import ServerTree from "@/components/mainDrawer/serverTree.vue";

@Component({
  components: {
    ServerTree,
    MenuSearch
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
