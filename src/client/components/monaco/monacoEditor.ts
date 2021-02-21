import * as monaco from 'monaco-editor';
import { listen, MessageConnection } from "vscode-ws-jsonrpc";
import {
  MonacoLanguageClient,
  MonacoServices,
  createConnection,
  ExecuteCommandParams,
} from "monaco-languageclient";
const ReconnectingWebSocket = require('reconnecting-websocket');
import { URI } from 'vscode-uri'

let languageClient: MonacoLanguageClient;
let connectionNames: string[] = []
let connectedConnectionName = ''

monaco.editor.setTheme('vs-dark')

export class monacoBootstrap {
  public editor: any

  constructor(containerID: string, currentTab: any) {
    this.initMonaco(containerID, currentTab)
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

    MonacoServices.install(this.editor);

    const URL = "ws://localhost:3000/server";
    const webSocket = createWebSocket(URL) as WebSocket;
    listen({
      webSocket,
      onConnection: (connection) => {
        console.log('CONNECTED')
        languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());

        languageClient.onReady().then(() => {
          console.log('CONNECTED 2')
          languageClient.onNotification('sqlLanguageServer.finishSetup', (params) => {
            connectionNames =
              params.personalConfig?.connections?.
                map((v: { name: string}) => v.name).
                filter((v: string) => !!v)
            connectedConnectionName = params.config?.name || ''
          })
        })
      },
    });

    function createLanguageClient(
      connection: MessageConnection
    ): MonacoLanguageClient {

      return new MonacoLanguageClient({
        name: "SQL Language Server MonacoClient",
        clientOptions: {
          documentSelector: ["sql"],
          workspaceFolder: {
            uri: URI.file('test'),
            name: 'workspace',
            index: 0
          }
        },
        connectionProvider: {
          get: (errorHandler, closeHandler) => {
            return Promise.resolve(
              createConnection(connection, errorHandler, closeHandler)
            );
          },
        },
      });
    }

    function createWebSocket(url: string): WebSocket {
      const socketOptions = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false,
      };

      return new ReconnectingWebSocket(url, [], socketOptions);
    }
  }
}

export function initClient() {

}

export function getLanguageClient() {
  return languageClient;
}

export function executeFixAllFixableProblemsCommand() {
  const params: ExecuteCommandParams = {
    command: 'fixAllFixableProblems',
    arguments: ['inmemory://model.sql']
  }
  languageClient.sendRequest('workspace/executeCommand', params)
}

export function executeSwitchDatabaseCommand(db: string) {
  const params: ExecuteCommandParams = {
    command: 'switchDatabaseConnection',
    arguments: [db]
  }
  languageClient.sendRequest('workspace/executeCommand', params)
}

export function getConnectionList() {
  return connectionNames
}

export function getCurrecntConnection() {
  return connectedConnectionName
}