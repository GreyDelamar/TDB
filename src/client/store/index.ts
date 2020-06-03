import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    servers: Array<mainStore.server>(),
    showLogin: true,
    monacoEditorCount: 1,
    editorTabs: Array<mainStore.editorTab>(),
    viewingEditorTab: null,
    mainViewHeight: null,
    mainNavWidth: null,
    mainViewWidth: null
  },
  mutations: {
    serverAdd(context, val) {
      context.servers.push(val);
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
    },
    serverRemove(context, val) {
      context.servers = context.servers.filter(d => d.guiID !== val);
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
      if (!context.servers.length) {
        context.showLogin = true
      }
    },
    showLogin(context, val) {
      context.showLogin = val;
    },
    addEditorTab (context, server: mainStore.server) {
      context.editorTabs.push({
        guiID: 'editor-tab-'+context.monacoEditorCount,
        name: `SQL ${context.monacoEditorCount}`,
        connName: server.connName || server.name,
        serverGuiID: server.guiID
      })
      context.monacoEditorCount++
    },
    viewingEditorTab (context, idx) {
      // It will pass the index postion it is viewing
      // Ex. context.editorTabs[context.viewingEditorTab]
      context.viewingEditorTab = idx
    },
    saveEditorTabContext (context, { tabIdx, state, model, value }) {
      let currentTab = context.editorTabs[tabIdx]
      currentTab.state = state
      currentTab.model = model
      currentTab.value = value
    },
    mainViewHeight (context, val) {
      context.mainViewHeight = val
    },
    mainNavWidth (context, val) {
      context.mainNavWidth = val
    },
    mainViewWidth (context, val) {
      context.mainViewWidth = val
    }
  },
  actions: {
    addNewServer (context, server: mainStore.server) {
      // prevent the same connection showing twice
      if (!context.state.servers.find(d => d.guiID === server.guiID)) {
        context.commit('serverAdd', server)
        context.commit('addEditorTab', server)
      }
    },
    resumeConnections (context, servers: Array<mainStore.server>) {
      if (servers.length) context.commit('showLogin', false)
      for (let i = 0; i < servers.length; i++) {
        const serv = servers[i];
        context.dispatch('addNewServer', serv)
      }
    }
  },
  getters: {
    getCurrentEditorTab (context) {
      return context.editorTabs[context.viewingEditorTab || 0]
    },
    mainViewHeight (context) {
      return context.mainViewHeight
    },
    mainViewWidth (context) {
      return context.mainViewWidth
    }
  }
});
