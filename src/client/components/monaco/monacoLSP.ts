import { MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, createConnection } from 'monaco-languageclient';
const normalizeUrl = require('normalize-url');
const ReconnectingWebSocket = require('reconnecting-websocket');

export function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
      name: "SQL Language Server MonacoClient",
      clientOptions: {
        documentSelector: ['sql']
      },
      connectionProvider: {
          get: (errorHandler, closeHandler) => {
              return Promise.resolve(
                createConnection(connection, errorHandler, closeHandler)
              );
          }
      }
  });
}

export function createUrl(path: string, host?: string): string {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return normalizeUrl(`${protocol}://${host || location.host}${location.pathname}${path}`);
}

export function createWebSocket(url: string): WebSocket {
  const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: true
  };

  return new ReconnectingWebSocket(url, [], socketOptions);
}