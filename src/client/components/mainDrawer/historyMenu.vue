<template>
  <div style="width: calc(100% - 72px);">
    <MenuSearch placeholder="Search History"/>

    <v-list class="pa-0" style="height: calc(100vh - 136px); overflow-y: auto;" dense>
      <v-list-item v-for="item in items" :key="item.title" @click="test">
        <v-list-item-content>
          <v-list-item-subtitle style="font-size: 0.7rem;">{{ item.createdAt.toLocaleString() }}</v-list-item-subtitle>
          <v-list-item-title style="font-size: 0.8rem;">{{ item.query }}</v-list-item-title>
          <v-list-item-subtitle style="font-size: 0.7rem;">{{ item.user }} - {{ item.server }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import MenuSearch from "@/components/mainDrawer/menuSearch.vue";

@Component({
  components: {
    MenuSearch
  }
})
export default class historyMenu extends Vue {
  items = []

  async mounted() {
    this.items = await this.$store.dispatch('history/get')
  }

  async updated() {
    this.items = await this.$store.dispatch('history/get')
  }

  test () {
    console.log('hit here')
  }
}
</script>
