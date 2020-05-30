<template>
  <v-app style="text-align: left;">
    <loginDialog :dialog.sync="showLogin" />

    <!-- <v-system-bar></v-system-bar> -->

    <v-app-bar app clipped-left> </v-app-bar>

    <v-navigation-drawer
      app
      clipped
      :width="navigation.width"
      ref="drawer"
      permanent
    >
      <MenuSearch :search.sync="menuSearchVal" />
      <MenuTree :searchTerm="menuSearchVal" />
    </v-navigation-drawer>

    <!-- Sizes your content based upon application components -->
    <v-content class="pt-0" id="main_content">
      <v-tabs v-if="openEditiors.length" v-model="viewingEditior" show-arrows>
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-for="oE in openEditiors" :key="oE.id">
          {{ oE.name }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="viewingEditior">
        <v-tab-item
          v-for="item in openEditiors"
          :key="item.id"
        >
          <MonacoEditor class="pa-1" :width="editorWidth"></MonacoEditor>
        </v-tab-item>
      </v-tabs-items>

    </v-content>

    <!-- <v-footer app> -->
    <!-- </v-footer> -->
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapState } from "vuex";
import ResizeObserver from 'resize-observer-polyfill';

import loginDialog from "@/components/loginDialog.vue";
import MenuSearch from "@/components/menuSearch.vue";
import MenuTree from "@/components/menuTree.vue";
import MonacoEditor from "@/components/monacoEditor.vue";

@Component({
  components: {
    loginDialog,
    MenuTree,
    MenuSearch,
    MonacoEditor
  },
  computed: {
    ...mapState(["servers"]),
    showLogin: {
      get () {
        return this.$store.state.showLogin
      },
      set (val) {
        this.$store.commit("showLogin", val);
      }
    }
  }
})
export default class App extends Vue {
  navigation: { width: number, borderSize: number }
  menuSearchVal: string
  editorWidth: number | boolean
  $refs!: {
    drawer: Vue
  }
  openEditiors: Array<{ [key: string]: any}>
  viewingEditior: any

  constructor() {
    super();
    this.navigation = { width: 350, borderSize: 5 }
    this.menuSearchVal = ""
    this.editorWidth = window.innerWidth - this.navigation.width
    this.openEditiors = []
    this.viewingEditior = null
  }

  beforeMount () {
    // Hide the loading screen
    const target = document.getElementById("mainLoadingScreen")
    if (target !== null) {
      target.style.display = "none";
    }
  };

  mounted () {
    this.$store.commit("serverReplace", localStorage.getItem("servers"));
    this.setBorderWidth();
    this.setEvents();
    this.editorWidth = window.innerWidth - this.navigation.width

    this.$nextTick(() => {
      // This will resize the editor
        const ro = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {left, top, width, height} = entry.contentRect;
                this.editorWidth = width
            }
        });

        ro.observe(<Element>document.getElementById("main_content"));

        this.$store.commit('monacoEditorCount')
        this.openEditiors.push({ id: this.$store.state.monacoEditorCount, name: `SQL ${this.$store.state.monacoEditorCount}` })
    })
  };


  setBorderWidth() {
    let target = this.$refs.drawer.$el.querySelector<HTMLElement>(
      ".v-navigation-drawer__border"
    );

    if (target !== null) {
      target.style.width = this.navigation.borderSize + "px";
      target.style.cursor = "ew-resize";
      target.style.backgroundColor = "#e8e8e8";
    }
  };

  setEvents() {
    const minSize = this.navigation.borderSize;
    const el = <HTMLElement>this.$refs.drawer.$el;
    const drawerBorder = el.querySelector<HTMLElement>(".v-navigation-drawer__border");
    const vm = this;
    const direction = el.classList.contains("v-navigation-drawer--right")
      ? "right"
      : "left";

    function resize(e: any) {
      document.body.style.cursor = "ew-resize";
      let f =
        direction === "right"
          ? document.body.scrollWidth - e.clientX
          : e.clientX;
      el.style.width = f + "px";
    }

    if (drawerBorder !== null) {
      drawerBorder.addEventListener(
        "mousedown",
        (e: MouseEvent) => {
          if (e.offsetX < minSize) {
            el.style.transition = "initial";
            document.addEventListener("mousemove", resize, false);
          }
        },
        false
      );
    }

    document.addEventListener(
      "mouseup",
      () => {
        el.style.transition = "";
        this.navigation.width = parseFloat(el.style.width);
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", resize, false);
      },
      false
    );
  };

  windowResize() {
    this.editorWidth = window.innerWidth - this.navigation.width
  }

}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  .v-window {
    height: 100%;
  }
}
</style>
