import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    servers: Array<mainStore.server>(),
    showLogin: true,
    monacoEditorCount: 1,
    editorTabs: Array<mainStore.editorTab>(),
    editorTabsResults: <mainStore.editorTabsResults>{},
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
        serverGuiID: server.guiID,
        showResultsPanel: false,
        minMaxResultsPanel: null
      })
      context.monacoEditorCount++
    },
    viewingEditorTab (context, idx) {
      // It will pass the index postion it is viewing
      // Ex. context.editorTabs[context.viewingEditorTab]
      context.viewingEditorTab = idx
    },
    saveEditorTabContext (context, { tabIdx, state, model, value, showResultsPanel, resultsPanelLoading, minMaxResultsPanel }) {
      let currentTab = context.editorTabs[tabIdx]
      if (state !== undefined) currentTab.state = state
      if (model !== undefined) currentTab.model = model
      if (value !== undefined) currentTab.value = value
      if (showResultsPanel !== undefined) currentTab.showResultsPanel = showResultsPanel === 'toggle' ? !currentTab.showResultsPanel : showResultsPanel
      if (minMaxResultsPanel !== undefined) currentTab.minMaxResultsPanel = minMaxResultsPanel === 'toggle' ? !currentTab.minMaxResultsPanel : minMaxResultsPanel
      if (resultsPanelLoading !== undefined) currentTab.resultsPanelLoading = resultsPanelLoading
    },
    mainViewHeight (context, val) {
      context.mainViewHeight = val
    },
    mainNavWidth (context, val) {
      context.mainNavWidth = val
    },
    mainViewWidth (context, val) {
      context.mainViewWidth = val
    },
    editorTabsResults (context, val:any) {
      let editorTab = context.editorTabs.find(d => d.guiID === val.editorGuiID)
      if (editorTab) editorTab.resultsPanelLoading = false
      context.editorTabsResults = Object.assign({}, context.editorTabsResults, { [val.editorGuiID]: (val.results || val.error) })
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
    },
    getCurrentEditorResults (context) {
      let editor = context.editorTabs[context.viewingEditorTab || 0]
      return context.editorTabsResults[editor.guiID]
    },
    editorTabsResults (context) {
      return context.editorTabsResults
    }
  }
});
