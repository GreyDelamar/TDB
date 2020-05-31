<template>
  <v-app style="text-align: left;">
    <loginDialog :dialog.sync="showLogin" />

    <!-- <v-system-bar></v-system-bar> -->

    <v-app-bar app clipped-left>
      <!-- spacer to match nav drawer - v-app-bar padding -->
      <div :style="`width: calc(${navigation.width}px - 16px)`"></div>
      <btnIconStack text="Run SQL" icon="fa-play" @clicked="runSQL"/>
    </v-app-bar>

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
    <v-content class="pt-0 edit-tabs">
      <v-tabs v-if="openEditiors.length" v-model="viewingEditior" show-arrows>
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-for="oE in openEditiors" :key="oE.id" class="d-flex flex-column pl-2 pr-2">
          <div>{{ oE.name }}</div>
          <small>
            <div>{{oE.connName}}</div>
          </small>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="viewingEditior" id="main_content">
        <v-tab-item v-for="oE in openEditiors" :key="'tab-'+oE.id">
          <MonacoEditor :ref="'tab-'+oE.id+'-editor'" class="pa-1" :width="editorWidth" :height="editorHeight"></MonacoEditor>
        </v-tab-item>
      </v-tabs-items>

    </v-content>

    <!-- <v-footer app> -->
    <!-- </v-footer> -->
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ResizeObserver from 'resize-observer-polyfill';
import { ipcRenderer } from 'electron';

import loginDialog from "@/components/loginDialog.vue";
import MenuSearch from "@/components/menuSearch.vue";
import MenuTree from "@/components/menuTree.vue";
import MonacoEditor from "@/components/monacoEditor.vue";
import btnIconStack from "@/components/btnIconStack.vue";

@Component({
  components: {
    loginDialog,
    MenuTree,
    MenuSearch,
    MonacoEditor,
    btnIconStack
  },
  computed: {
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
  editorWidth: number
  editorHeight: number
  $refs!: { [key: string]: any}
  seenConnections: Array<{ [key: string]: any}>
  openEditiors: Array<{ [key: string]: any}>
  viewingEditior: any

  constructor() {
    super();
    this.navigation = { width: 350, borderSize: 5 }
    this.menuSearchVal = ""
    this.editorWidth = window.innerWidth - this.navigation.width
    this.editorHeight = 50
    this.openEditiors = []
    this.viewingEditior = null
    this.seenConnections = []
  }

  get servers () {
    return this.$store.state.servers
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
                this.editorHeight = height
            }
        });

        ro.observe(<Element>document.getElementById("main_content"));
    })
  };

  setBorderWidth() {
    let el =  <Element>this.$refs.drawer.$el
    let target = el.querySelector<HTMLElement>(".v-navigation-drawer__border");

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

  runSQL () {
    if (this.viewingEditior === null || this.viewingEditior === undefined) return null
    const editor = this.openEditiors[this.viewingEditior]
    const server = this.servers.find((d:any) => d.guiID === editor.serverGuiID)
    const monaco = this.$refs['tab-'+editor.id+'-editor'][0]
    const query = monaco._getValue()
    ipcRenderer.send('server:runQuery', server.opts, query)
  }

  @Watch('servers')
  onServerChange(val: any) {
    const currentConn = this.seenConnections

    if (val) {
      for (let i = 0; i < val.length; i++) {
        const server = val[i];
        if (!currentConn.find(d => d.guiID === server.guiID)) {
          currentConn.push(server)

          this.$store.commit('monacoEditorCount')
          this.viewingEditior = this.$store.state.monacoEditorCount
          server.openEditiors = []
          this.openEditiors.push({
            id: this.$store.state.monacoEditorCount,
            name: `SQL ${this.$store.state.monacoEditorCount}`,
            connName: server.name,
            serverGuiID: server.guiID
          })
        }
      }
    }
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
    height: calc(100% - 48px);
  }

  .v-application--wrap {
    min-height: calc(100vh - 60px);
  }

  .edit-tabs {
    small {
      font-size: 60%;
    }
  }
}
</style>
