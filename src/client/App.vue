<template>
  <v-app style="text-align: left;">
    <loginDialog :dialog.sync="showLogin" />

    <!-- <v-system-bar></v-system-bar> -->

    <v-app-bar app clipped-left>
      <btnIconStack lineOne="Add" lineTwo="Connection" icon="fa-plug" @clicked="toggleLoginDialog" />
      <btnIconStack lineOne="Load File" icon="fa-folder-open" @clicked="showOpenDialog" />
      <btnIconStack lineOne="Run SQL" icon="fa-play" @clicked="runSQL" />
    </v-app-bar>

    <v-navigation-drawer
      app
      clipped
      :width="navigation.width"
      ref="mainDrawer"
      permanent
    >
      <div class="row" style="height: 100%">
        <MenuSide :tab.sync="navigation.tab"/>
        <ServerMenu v-show="navigation.tab === 1" />
        <HistoryMenu v-show="navigation.tab === 2" />
      </div>
    </v-navigation-drawer>

    <!-- Sizes your content based upon application components -->
    <v-content class="pt-0 edit-tabs" ref="mainContent">
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
import MenuSide from "@/components/menuSide.vue";
import ServerMenu from "@/components/menus/serverMenu.vue";
import HistoryMenu from "@/components/menus/historyMenu.vue";

@Component({
  components: {
    loginDialog,
    btnIconStack,
    MenuSide,
    ServerMenu,
    HistoryMenu
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
  navigation= { width: 350, borderSize: 5, tab: 1 }
  $refs!: { [key: string]: any}
  menuRoute = 'server'

  constructor() {
    super();

    this.$nextTick(async () => {
      console.log('Query History:', await this.$store.dispatch('history/get'))
    })
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
      if (f >= 48) {
        mainDrawer.style.width = f + "px";
        $self.navigation.width = f;
      }
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
  };

  runSQL () {
    this.$parent.$emit('runSQL')
  };
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
