<template>
  <v-app>
    <loginDialog :dialog.sync="showLogin" />

    <v-system-bar>
      <!--  -->
    </v-system-bar>

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
    <v-content class="pt-0">
      <MonacoEditor class="pa-1"></MonacoEditor>
    </v-content>

    <!-- <v-footer app> -->
    <!-- </v-footer> -->
  </v-app>
</template>

<script>
import { mapState } from "vuex";

import loginDialog from "@/components/loginDialog.vue";
import MenuSearch from "@/components/menuSearch.vue";
import MenuTree from "@/components/menuTree.vue";
import MonacoEditor from "@/components/monacoEditor.vue";

export default {
  name: "App",

  components: {
    loginDialog,
    MenuTree,
    MenuSearch,
    MonacoEditor
  },

  beforeMount() {
    // Hide the loading screen
    document.getElementById("mainLoadingScreen").style.display = "none";
  },

  mounted() {
    this.$store.commit("serverReplace", localStorage.getItem("servers"));
    this.setBorderWidth();
    this.setEvents();
  },

  data: () => ({
    navigation: {
      width: 350,
      borderSize: 5
    },
    menuSearchVal: ""
  }),

  computed: {
    ...mapState(["servers", "showLogin"])
  },

  methods: {
    setBorderWidth() {
      let i = this.$refs.drawer.$el.querySelector(
        ".v-navigation-drawer__border"
      );
      i.style.width = this.navigation.borderSize + "px";
      i.style.cursor = "ew-resize";
      i.style.backgroundColor = "#e8e8e8";
    },
    setEvents() {
      const minSize = this.navigation.borderSize;
      const el = this.$refs.drawer.$el;
      const drawerBorder = el.querySelector(".v-navigation-drawer__border");
      const vm = this;
      const direction = el.classList.contains("v-navigation-drawer--right")
        ? "right"
        : "left";

      function resize(e) {
        document.body.style.cursor = "ew-resize";
        let f =
          direction === "right"
            ? document.body.scrollWidth - e.clientX
            : e.clientX;
        el.style.width = f + "px";
      }

      drawerBorder.addEventListener(
        "mousedown",
        e => {
          if (e.offsetX < minSize) {
            el.style.transition = "initial";
            document.addEventListener("mousemove", resize, false);
          }
        },
        false
      );

      document.addEventListener(
        "mouseup",
        () => {
          el.style.transition = "";
          this.navigation.width = el.style.width;
          document.body.style.cursor = "";
          document.removeEventListener("mousemove", resize, false);
        },
        false
      );
    }
  }
};
</script>
