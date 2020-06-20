
import * as monaco from 'monaco-editor-core';
import { listen } from 'vscode-ws-jsonrpc';
import { MonacoServices } from 'monaco-languageclient';
import { createUrl, createLanguageClient, createWebSocket } from './monacoLSP';

monaco.editor.setTheme('vs-dark')

export class monacoBootstrap {
    editor: any

    constructor (containerID: string) {
        this.initMonaco(containerID)
    }

    private initMonaco (containerID: string) {
        // create Monaco editor
        this.editor = <any>monaco.editor.create(document.getElementById(containerID)!, {
            model: monaco.editor.createModel('', 'sql'),
            glyphMargin: false,
            lightbulb: {
                enabled: true
            },
            automaticLayout: true
        });

        // install Monaco language client services
        MonacoServices.install(this.editor);

        // create the web socket
        const url = createUrl('/sampleServer')
        const webSocket = createWebSocket(url);
        // listen when the web socket is opened
        listen({
            webSocket,
            onConnection: connection => {
                // create and start the language client
                const languageClient = createLanguageClient(connection);
                const disposable = languageClient.start();
                connection.onClose(() => disposable.dispose());
            }
        });

        return this.editor;
    }

}
