declare namespace mainStore {
  interface connection {
    server: string
    username: string
    user: string
    guiID: string
    port: number
    database: string
  }

  interface server {
    name:  string
    guiID: string
    guiType: string
    connName?: string
  }

  interface editorTab {
    guiID: string
    name: string
    connName: string
    serverGuiID: string
    state?: any
    model?: any
    value?: any
  }
}

declare module 'vue-resize'