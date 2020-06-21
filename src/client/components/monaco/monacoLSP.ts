
import { MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, createConnection } from 'monaco-languageclient';
const normalizeUrl = require('normalize-url');
const ReconnectingWebSocket = require('reconnecting-websocket');

export function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
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
  });
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