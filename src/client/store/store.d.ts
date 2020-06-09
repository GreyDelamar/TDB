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
    showResultsPanel: boolean
    resultsPanelLoading?: boolean | undefined
    resultsPanelHeight?: number | undefined
    minMaxResultsPanel?: boolean | null
    state?: any
    model?: any
    value?: any
    filePath?: string | undefined
  }

  interface editorTabsResults {
    [ key: string ]: {
      columns?: Array<{ text: string }>
      output?: object // seems to be empty most of the time
      recordset?: Array<queryRow> // not reall needed
      recordsets?: [ [ queryRow ] ] // should be like this
      rowsAffected?: [] // count of rows affected
      error?: string
    }
  }
}

interface loadedFile {
  filePath: string,
  fileName: string,
  fileContent: string
}

declare module 'vue-resize'
