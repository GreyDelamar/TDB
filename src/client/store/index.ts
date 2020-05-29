import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);


export interface connection {
  server: string
  username: string
  user: string
  guiID: string
  port: number
  database: string
}

export interface server {
  name:  string
  guiID: string
  guiType: string
}


export default new Vuex.Store({
  state: {
    connections: Array<connection>(),
    servers: Array<server>(),
    showLogin: true
  },
  mutations: {
    serverAdd(context, val) {
      context.servers.push(val);
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
    },
    serverRemove(context, val) {
      context.servers = context.servers.filter(d => d.guiID !== val);
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
    },
    serverConnect(context, config) {
    },
    connectionAdd(context, val) {
      context.connections.push(val);
      window.localStorage.setItem("connections", JSON.stringify(context.connections));
    },
    connectionRemove(context, val) {
      context.connections = context.connections.filter(d => d.guiID !== val);
      window.localStorage.setItem("connections", JSON.stringify(context.connections));
    },
  },
  actions: {},
  modules: {}
});
