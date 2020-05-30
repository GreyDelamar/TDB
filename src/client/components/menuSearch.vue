<template>
  <v-sheet class="pa-3 pr-5 black-icon-color">
    <v-text-field
      v-model="searchTemp"
      placeholder="Ex. id    (ie 'DB/Table/Column')"
      dark
      flat
      solo-inverted
      hide-details
      clearable
    ></v-text-field>
  </v-sheet>
</template>

<script>
export default {
  name: "menuSearch",

  props: {
    search: String
  },

  computed: {
    searchTemp: {
      get() {
        return this.$props.search;
      },
      set(val) {
        this.$emit("update:search", val);
      }
    }
  }
};
</script>

<style lang="scss">
.black-icon-color {
  .theme--dark.v-icon.v-icon {
    color: #121212 !important;
  }
}
</style>
