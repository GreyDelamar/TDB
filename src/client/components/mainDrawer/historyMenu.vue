<template>
  <div style="width: calc(100% - 72px);">
    <MenuSearch :search.sync="searchVal" placeholder="Search History"/>

    <v-list class="pa-0" style="height: calc(100vh - 136px); overflow-y: auto;" dense>
      <v-list-item v-for="item in items" :key="item.title" @click="newEditorTab(item)">
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
import { Component, Vue, Watch } from "vue-property-decorator"

import history, { historyRow } from "@/lib/history.ts"
import MenuSearch from "@/components/mainDrawer/menuSearch.vue"

@Component({
  components: {
    MenuSearch
  }
})
export default class historyMenu extends Vue {
  items = Array<historyRow | any>()
  searchVal = ""
  searching = false

  async mounted() {
    this.items = await history.getAll()
  }

  async updated() {
    if (!this.searching) this.items = await history.getAll()
  }

  newEditorTab (item: any) {
    const editor = this.$store.getters.getCurrentEditorTab
    const server = this.$store.state.servers.find((d:any) => d.guiID === editor.serverGuiID)
    this.$store.commit('addEditorTab', { server, editorTab: item })
  }

  @Watch('searchVal')
  async searchValChange (val: string) {
    if (!val) {
      this.items = []
      this.searching = false
      return true;
    }

    this.searching = true
    const results = await history.search(val)
    const tempItems = []

    for (let idx = 0; idx < results.length; idx++) {
      const res = results[idx];
      tempItems.push(res.item)
    }

    this.items = tempItems
  }

}
</script>
