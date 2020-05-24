import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    servers: [],
    showLogin: true
  },
  mutations: {
    serverAdd(context, val) {
      context.servers.push(val);
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
    },
    serverRemove(context, val) {
      context.servers = context.servers.filter(d => d.token !== val);
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
    },
    serverReplace(context, val) {
      try {
        val = JSON.parse(val);
        context.servers = val || [];
        context.showLogin = context.servers.length === 0;
        window.localStorage.setItem("servers", JSON.stringify(context.servers));
      } catch (error) {
        window.localStorage.setItem("servers", JSON.stringify([]));
        console.error(
          "ERROR PARSING LOCAL STORAGE.... CLEARING CACHED SERVERS"
        );
      }
    },
    showLogin(context, val) {
      context.showLogin = val;
    }
  },
  actions: {},
  modules: {}
});
