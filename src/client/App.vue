<template>
  <v-app style="text-align: left;">
    <loginDialog :dialog.sync="showLogin" />

    <!-- <v-system-bar></v-system-bar> -->

    <v-app-bar app clipped-left>
      <!-- spacer to match nav drawer - v-app-bar padding -->
      <div :style="`width: calc(${navigation.width}px - 16px)`"></div>
      <btnIconStack lineOne="Run SQL" icon="fa-play" />
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
      <router-view></router-view>
    </v-content>

    <!-- <v-footer app> -->
    <!-- </v-footer> -->
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { ipcRenderer } from 'electron';

import loginDialog from "@/components/loginDialog.vue";
import MenuSearch from "@/components/menuSearch.vue";
import MenuTree from "@/components/menuTree.vue";
import btnIconStack from "@/components/btnIconStack.vue";

@Component({
  components: {
    loginDialog,
    MenuTree,
    MenuSearch,
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
  $refs!: { [key: string]: any}

  constructor() {
    super();
    this.navigation = { width: 350, borderSize: 5 }
    this.menuSearchVal = ""
  }

  get servers () {
    return this.$store.state.servers
  }

  beforeMount () {
    let resConn = localStorage.getItem("servers")
    if (resConn) resConn = JSON.parse(resConn)
    this.$store.dispatch("resumeConnections", resConn || [])

    // Hide the loading screen
    const target = document.getElementById("mainLoadingScreen")
    if (target !== null) {
      target.style.display = "none";
    }
  };

  mounted () {
    ipcRenderer.on('server:runQuery:result', this.logger)
    ipcRenderer.on('log:main', this.logger)

    this.setBorderWidth();
    this.setEvents();
  };

  beforeDestroy () {
    ipcRenderer.removeListener('log:main', this.logger)
    ipcRenderer.removeListener('server:runQuery:result', this.logger)
  };

  logger (e:any, data:any) {
    console.log('DB LOG - ', data)
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

  runSQL () {
    // this.$store.state.editorEventBus.$emit('runSQL')
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

  .v-window__container {
    height: 100%;
  }

  .v-window-item {
    height: 100%;
  }
}
</style>
