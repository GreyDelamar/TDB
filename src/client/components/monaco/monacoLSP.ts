
import * as path from 'path'
import { MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, createConnection } from 'monaco-languageclient';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient'
import { ExecuteCommandParams } from 'vscode-languageserver-protocol'


const normalizeUrl = require('normalize-url');
const ReconnectingWebSocket = require('reconnecting-websocket');


function createSQLServerLSP() {
  let serverModule = '/home/dev/.nvm/versions/node/v13.6.0/bin/sql-language-server'
  let execArgs = ['up', '--method', 'node-ipc', '-d']
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  let connectionNames = []
  let connectedConnectionName = ''

  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc, args: execArgs },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions, args: execArgs }
  }

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ language: 'sql', pattern: '**/*.sql' }],
    diagnosticCollectionName: 'sqlLanguageServer',
    synchronize: {
      configurationSection: 'sqlLanguageServer',
//      fileEvents: workspace.createFileSystemWatcher('**/.sqllsrc.json')
    }
  }

  let client = new LanguageClient('sqlLanguageServer', 'SQL Language Server', serverOptions, clientOptions)

  client.registerProposedFeatures()

  client.onReady().then(() => {
    client.onNotification('sqlLanguageServer.finishSetup', (params) => {
      console.log("SETUP!")
      connectionNames =
        params.personalConfig?.connections?.
          map((v: { name: string }) => v.name).
          filter((v: string) => !!v)
      connectedConnectionName = params.config?.name || ''
    })
    client.onNotification('sqlLanguageServer.error', (params) => {
      console.error(params)
    })
  })

  return client
}


export function createLanguageClient() {
  return createSQLServerLSP()

  /*return new MonacoLanguageClient({
      name: "Sample Language Client",
      clientOptions: {
          // use a language id as a document selector
          documentSelector: ['json'],
          // disable the default error handler
          errorHandler: {
              error: () => ErrorAction.Continue,
              closed: () => CloseAction.DoNotRestart
          }
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
          get: (errorHandler, closeHandler) => {
              return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
          }
      }
  });*/
}

export function createUrl(path: string): string {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
}

export function createWebSocket(url: string): WebSocket {
  const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false
  };
  return new ReconnectingWebSocket(url, [], socketOptions);
}