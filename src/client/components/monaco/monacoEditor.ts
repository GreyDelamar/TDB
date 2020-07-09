
import * as monaco from 'monaco-editor-core';
import { listen } from 'vscode-ws-jsonrpc';
import { MonacoServices } from 'monaco-languageclient';
import { createUrl, createLanguageClient, createWebSocket } from './monacoLSP';
import Vue from 'vue';
const sqlFormatter = require('sql-formatter');

monaco.editor.setTheme('vs-dark')

monaco.languages.register({
  id: "sql",
  extensions: [".sql"],
  aliases: ["SQL", "sql"],
  mimetypes: ["application/json"]
});

// Register SQL Formatter
monaco.languages.registerDocumentFormattingEditProvider("sql", {
  async provideDocumentFormattingEdits(model) {
    const text = sqlFormatter.format(model.getValue());

    return [
      {
        range: model.getFullModelRange(),
        text
      }
    ];
  }
});

export class monacoBootstrap {
  public editor: any
  public eventBus: Vue

  constructor(containerID: string, currentTab: any) {
    this.initMonaco(containerID, currentTab)
    this.eventBus = new Vue();
  }

  private initMonaco(containerID: string, currentTab: any = {}) {
    // create Monaco editor
    this.editor = <any>monaco.editor.create(document.getElementById(containerID)!, {
      model: monaco.editor.createModel(currentTab.value || `SELECT * FROM users`, 'sql'),
      glyphMargin: false,
      lightbulb: {
        enabled: true
      }
    });

    // on hot reload restore state
    if (currentTab.state !== undefined) this.editor.restoreViewState(currentTab.state);

    // install Monaco language client services
    MonacoServices.install(this.editor);

    // create the web socket
    const url = createUrl('/lsp-server', 'localhost:3000')
    const webSocket = createWebSocket(url);
    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: connection => {
        console.log(connection)
        // create and start the language client
        try {
          const languageClient = createLanguageClient(connection);
          const disposable = languageClient.start();
          // connection.onClose(() => disposable.dispose());
        } catch (error) {
          console.log(error)
        }
      }
    });
  }
}
