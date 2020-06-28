<template>
  <v-sheet class="pa-3 black-icon-color">
    <v-text-field
      v-model="searchTemp"
      :placeholder="placeholder || `Ex. id  (ie 'DB/Table/Column')`"
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
  name: "serverSearch",

  props: {
    search: String,
    placeholder: String
  },

  data() {
    return {
      _timerId: null
    };
  },

  methods: {
    fetchEntriesDebounced(val) {
      // cancel pending call
      clearTimeout(this._timerId)

      // delay new call 500ms
      this._timerId = setTimeout(() => {
        this.$emit("update:search", val);
      }, 500)
    }
  },

  computed: {
    searchTemp: {
      get() {
        return this.$props.search;
      },
      set(val) {
        this.fetchEntriesDebounced(val)
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
