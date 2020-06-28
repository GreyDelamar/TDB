<template>
  <v-navigation-drawer color="#1E1E1E" mini-variant mini-variant-width="56" permanent>
    <v-list class="pa-0">
      <v-list-item-group v-model="tempTab" color="primary">
        <v-list-item v-for="(item, i) in items" :key="i" class="pl-3 pr-0">
          <v-list-item-action class="flex justify-center">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" v-text="item.icon"></v-icon>
              </template>
              <span style="text-transform: capitalize;">{{ item.title }}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component({
  props: {
    tab: Number
  }
})
export default class navDrawer extends Vue {
  items = [
    { title: 'Quick Connections', icon: 'fa-bolt' },
    { title: 'Connections', icon: 'fa-database' },
    { title: 'History', icon: 'fa-history' }
  ]
  tempTab = 1

  mounted() {
    this.tempTab = this.$props.tab
  }

  @Watch('tempTab')
  watchTab (val: any) {
    this.$emit('update:tab', val)
  }
}
</script>

<style lang="scss" scoped>
</style>
