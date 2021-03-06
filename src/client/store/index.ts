import Vue from "vue";
import Vuex from "vuex";

import createPersistedState from "vuex-persistedstate";
import database from './modules/database';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    database
  },
  plugins: [
    createPersistedState()
  ],
  state: {
    connectedWithServer: false,
    servers: Array<mainStore.server>(),
    showLogin: true,
    monacoEditorCount: 1,
    editorTabs: Array<mainStore.editorTab>(),
    editorTabsResults: <mainStore.editorTabsResults>{},
    viewingEditorTab: null,
    mainViewHeight: null,
    mainNavWidth: null
  },
  mutations: {
    setServerConnectionStatus(context, boolean: boolean) {
      context.connectedWithServer = boolean
    },
    serverAdd(context, val) {
      context.servers.push(val);
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
    },
    serverRemove(context, val) {
      let editorGuiIDs = <any>[]

      // Remove server
      context.servers = context.servers.filter(d => d.guiID !== val);

      if (context.servers.length <= 0) {
        // Set global connectedWithServer flag to false
        context.connectedWithServer = false
      }

      // Clear open editors belong to server
      context.editorTabs = context.editorTabs.filter(d => {
        if (d.serverGuiID === val) editorGuiIDs.push(d.guiID)
        return d.serverGuiID !== val
      });

      // Clear the results out of store
      for (let idx = 0; idx < editorGuiIDs.length; idx++) {
        const guiID = editorGuiIDs[idx];
        delete context.editorTabsResults[guiID]
      }

      // Set server list in localstorage for later use
      window.localStorage.setItem("servers", JSON.stringify(context.servers));
      if (!context.servers.length) {
        context.showLogin = true
      }
    },
    showLogin(context, val) {
      context.showLogin = val;
    },
    addEditorTab (context, { server, editorTab } : { server: mainStore.server, editorTab?: any }) {
      const tempTabIdx = context.editorTabs.findIndex(d => d.temporary)
      if (tempTabIdx >= 0) {
        Vue.set(context.editorTabs, tempTabIdx, {
          ...context.editorTabs[tempTabIdx],
          ...{
            showResultsPanel: false,
            minMaxResultsPanel: null,
            state: editorTab?.state,
            value: editorTab?.value,
            temporary: editorTab?.value ? true : undefined
          }
        })
      } else {
        context.editorTabs.push({
          guiID: 'editor-tab-'+context.monacoEditorCount,
          name: `SQL ${context.monacoEditorCount}`,
          connName: server.connName || server.name,
          serverGuiID: server.guiID,
          showResultsPanel: false,
          minMaxResultsPanel: null,
          state: editorTab?.state,
          model: editorTab?.model,
          value: editorTab?.value,
          temporary: editorTab?.value ? true : undefined
        })
        context.monacoEditorCount++
      }
    },
    loadFileAddTab (context, {file, server}: { file: loadedFile, server: mainStore.server }) {
      context.editorTabs.push({
        guiID: 'editor-tab-'+context.monacoEditorCount,
        name: `${file.fileName}`,
        connName: server.connName || server.name,
        serverGuiID: server.guiID,
        showResultsPanel: false,
        minMaxResultsPanel: null,
        value: file.fileContent,
        filePath: file.filePath,
        savedValue: file.fileContent,
        dirty: false
      })

      context.monacoEditorCount++
    },
    viewingEditorTab (context, idx) {
      // It will pass the index postion it is viewing
      // Ex. context.editorTabs[context.viewingEditorTab]
      context.viewingEditorTab = idx
    },
    saveEditorTabContext (context, { tabIdx, state, model, value, showResultsPanel, resultsPanelLoading, minMaxResultsPanel, filePath, guiID, name, temporary, savedValue }) {
      let currentTab = context.editorTabs[tabIdx !== undefined ? tabIdx : context.viewingEditorTab]

      if (!tabIdx && guiID) {
        const tmp = context.editorTabs.find(d => d.guiID === guiID) || context.viewingEditorTab
        if (tmp) currentTab = tmp
      }

      if (currentTab) {
        if (state !== undefined) currentTab.state = state
        if (model !== undefined) currentTab.model = model
        if (showResultsPanel !== undefined) currentTab.showResultsPanel = showResultsPanel === 'toggle' ? !currentTab.showResultsPanel : showResultsPanel
        if (minMaxResultsPanel !== undefined) currentTab.minMaxResultsPanel = minMaxResultsPanel === 'toggle' ? !currentTab.minMaxResultsPanel : minMaxResultsPanel
        if (resultsPanelLoading !== undefined) currentTab.resultsPanelLoading = resultsPanelLoading
        if (filePath !== undefined) currentTab.filePath = filePath
        if (name !== undefined) currentTab.name = name
        if (temporary !== undefined) currentTab.temporary = temporary
        if (savedValue !== undefined) {
          currentTab.savedValue = savedValue
          currentTab.dirty = false
        }
        if (value !== undefined) {
          currentTab.value = value
          currentTab.dirty = currentTab.savedValue !== value
        }
      }
    },
    mainViewHeight (context, val) {
      context.mainViewHeight = val
    },
    mainNavWidth (context, val) {
      context.mainNavWidth = val
    },
    editorTabsResults (context, val:any) {
      let editorTab = context.editorTabs.find(d => d.guiID === val.editorGuiID)
      if (editorTab) editorTab.resultsPanelLoading = false
      context.editorTabsResults = Object.assign({}, context.editorTabsResults, { [val.editorGuiID]: (val.results || val.error) })
    },
    removeEditorTab (context, guiID: string) {
      // Remove editor tab
      context.editorTabs = context.editorTabs.filter(d => d.guiID !== guiID);

      // Clear the results out of store
      delete context.editorTabsResults[guiID]
    }
  },
  actions: {
    connectServer(context, serverGuid) {

      const server = context.state.servers.filter(server => server.guiID !== serverGuid);

      if(server) {
        context.commit('addEditorTab', { server })  
        context.commit('setServerConnectionStatus', true)
      }
    },
    removeServer(context, serverGuid: string) {

      if(context.state.servers.length <= 1) {
        context.commit('setServerConnectionStatus', false)
      }

      context.commit('serverRemove', serverGuid)


    },
    addNewServer (context, server: mainStore.server) {
      // prevent the same connection showing twice
      if (!context.state.servers.find(d => d.guiID === server.guiID)) {
        context.commit('serverAdd', server)
        context.commit('addEditorTab', { server })
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
    getCurrentEditorResults (context) {
      let editor = context.editorTabs[context.viewingEditorTab || 0]
      return context.editorTabsResults[editor.guiID]
    },
    editorTabsResults (context) {
      return context.editorTabsResults
    }
  }
});
