<template>
  <v-navigation-drawer
    dark
    mini-variant
    mini-variant-width="56"
    permanent
  >
    <v-list
      dense
      nav
      class="pr-0"
    >

      <v-list-item
        v-for="item in items"
        :key="item.title"
        @click="test"
        class="mb-2"
      >
        <v-list-item-action class="flex justify-center">
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
</v-navigation-drawer>
</template>

<script>

export default {
  name: "serverSide",

  props: {
  },

  mounted() {
    const $self = this;

  },

  data: () => ({
    items: [{title: 'Quick Connections', icon: 'fa-bolt'}, {title: 'Connections', icon: 'fa-database'}, {title: 'History', icon: 'fa-history'}]
  }),

  methods: {
    test () {
      console.log('HIT')
    }
  },

  computed: {
  },

  watch: {
  }
};
</script>

<style lang="scss" scoped>
</style>
