<template>
  <v-app style="text-align: left;">
    <loginDialog :dialog.sync="showLogin" />

    <!-- <v-system-bar></v-system-bar> -->

    <v-app-bar app clipped-left>
      <!-- spacer to match nav drawer - v-app-bar padding -->
      <div :style="`width: calc(${navigation.width}px - 16px)`">
        <btnIconStack lineOne="Add" lineTwo="Connection" icon="fa-plug" @clicked="toggleLoginDialog" />

      </div>
      <btnIconStack lineOne="Run SQL" icon="fa-play" @clicked="$emit('runSQL');" />
      <btnIconStack lineOne="Load File" icon="fa-folder-open" @clicked="showOpenDialog" />
    </v-app-bar>

    <v-navigation-drawer
      app
      clipped
      :width="navigation.width"
      ref="mainDrawer"
      permanent
    >
      <div class="row" style="height: 100%">
        <MenuSide />
        <ServerMenu />
      </div>
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
import btnIconStack from "@/components/btnIconStack.vue";
import ServerMenu from "@/components/menus/serverMenu.vue";
import MenuSide from "@/components/menuSide.vue";

@Component({
  components: {
    loginDialog,
    ServerMenu,
    btnIconStack,
    MenuSide
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
  $refs!: { [key: string]: any}

  constructor() {
    super();
    this.navigation = { width: 350, borderSize: 5 }

    this.$nextTick(async () => {
      this.mainViewWidth = this.$refs.mainDrawer.$el.offsetWidth  - this.navigation.width
      console.log('Query History:', await this.$store.dispatch('history/get'))
    })
  }

  get servers () {
    return this.$store.state.servers
  }

  get mainViewWidth () {
    return this.$store.state.mainViewWidth
  }

  set mainViewWidth (val) {
    this.$store.commit('mainViewWidth', val)
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

  getMenuBorder () {
    const mainDrawer = <HTMLElement>this.$refs.mainDrawer.$el;
    const borders = this.$refs.mainDrawer.$el.querySelectorAll('.v-navigation-drawer__border')
    const border = borders[borders.length - 1];

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
    const $self = this;
    const minSize = this.navigation.borderSize;
    let { mainDrawer, border } = this.getMenuBorder()
    const direction = mainDrawer.classList.contains("v-navigation-drawer--right") ? "right" : "left";

    function resize(e: any) {
      document.body.style.cursor = "ew-resize";
      let f = direction === "right" ? document.body.scrollWidth - e.clientX : e.clientX;
      mainDrawer.style.width = f + "px";
      $self.navigation.width = f;
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
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", resize, false);
    }, false);
  };

  toggleLoginDialog () {
    this.$store.commit('showLogin', true)
  };

  showOpenDialog () {
    ipcRenderer.send('showOpenDialog')
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
