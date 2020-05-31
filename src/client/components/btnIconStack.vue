<template>
  <v-btn text class="pb-1 pt-1 btn-icon-stack" @click.stop="$emit('clicked')">
    <div class="d-flex flex-column">
      <v-icon class="pb-1 sm-icon">{{icon}}</v-icon>
      <span>{{text}}</span>
    </div>
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  props: {
    icon: String,
    text: String
  }
})
export default class btnIconStack extends Vue {}
</script>

<style lang="scss" scoped>
.sm-icon {
  font-size: 18px;
}

.v-btn.btn-icon-stack {
  height: 42px;
}
</style>
