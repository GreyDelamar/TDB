<template>
  <v-app style="text-align: left;">
    <loginDialog :dialog.sync="showLogin" />

    <!-- <v-system-bar></v-system-bar> -->

    <v-app-bar app clipped-left>
      <!-- spacer to match nav drawer - v-app-bar padding -->
      <div :style="`width: calc(${navigation.width}px - 16px)`"></div>
      <btnIconStack lineOne="Run SQL" icon="fa-play" @clicked="runSQL" />
    </v-app-bar>

    <v-navigation-drawer
      app
      clipped
      :width="navigation.width"
      ref="mainDrawer"
      permanent
    >
      <MenuSearch :search.sync="menuSearchVal" />
      <MenuTree :searchTerm="menuSearchVal" />
      <resize-observer @notify="handleResize" />
    </v-navigation-drawer>

    <!-- Sizes your content based upon application components -->
    <v-content class="pt-0 edit-tabs" ref="mainContent">
      <resize-observer @notify="handleResizeWidth" />
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

    this.$nextTick(() => {
      this.mainViewWidth = this.$refs.mainDrawer.$el.offsetWidth  - this.navigation.width
    })
  }

  get servers () {
    return this.$store.state.servers
  }

  get mainViewHeight () {
    return this.$store.state.mainViewHeight
  }

  set mainViewHeight (val) {
    this.$store.commit('mainViewHeight', val)
  }

  get mainViewWidth () {
    return this.$store.state.mainViewWidth
  }

  set mainViewWidth (val) {
    this.$store.commit('mainViewWidth', val)
  }

  get mainNavWidth () {
    return this.$store.state.mainNavWidth
  }

  set mainNavWidth (val) {
    this.$store.commit('mainNavWidth', val)
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
    ipcRenderer.on('log:main', this.logger)

    this.setBorderWidth();
    this.setEvents();
  };

  beforeDestroy () {
    ipcRenderer.removeListener('log:main', this.logger)
  };

  logger (e:any, data:any) {
    console.log('DB LOG - ', data)
  };

  handleResizeWidth (e: { width: number, height: number }) {
    this.mainViewWidth = e.width;
  };

  handleResize (e: { width: number, height: number }) {
    this.mainViewHeight = e.height;
    this.mainNavWidth = e.width;
  };

  getMenuBorder () {
    const mainDrawer = <HTMLElement>this.$refs.mainDrawer.$el;
    const border = mainDrawer.querySelector<HTMLElement>(".v-navigation-drawer__border");

    return { mainDrawer, border };
  }

  setBorderWidth() {
    let { border } = this.getMenuBorder()

    if (border !== null) {
      border.style.width = this.navigation.borderSize + "px";
      border.style.cursor = "ew-resize";
      border.style.backgroundColor = "#e8e8e8";
    }
  };

  setEvents() {
    const minSize = this.navigation.borderSize;
    let { mainDrawer, border } = this.getMenuBorder()
    const vm = this;
    const direction = mainDrawer.classList.contains("v-navigation-drawer--right") ? "right" : "left";

    function resize(e: any) {
      document.body.style.cursor = "ew-resize";
      let f = direction === "right" ? document.body.scrollWidth - e.clientX : e.clientX;
      mainDrawer.style.width = f + "px";
    }

    if (border !== null) {
      border.addEventListener("mousedown", (e: MouseEvent) => {
        if (e.offsetX < minSize) {
          mainDrawer.style.transition = "initial";
          document.addEventListener("mousemove", resize, false);
        }
      }, false);
    }

    document.addEventListener("mouseup", () => {
      mainDrawer.style.transition = "";
      this.navigation.width = parseFloat(mainDrawer.style.width);
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", resize, false);
    }, false);
  };

  runSQL () {
    console.log('I AM BROKEN')
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
  .v-icon.v-icon {
    font-size: 18px;
  }
}
</style>
