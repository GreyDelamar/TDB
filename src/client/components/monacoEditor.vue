<template>
  <div class="monaco_editor_container" :style="style"></div>
</template>

<script>
import * as monaco from 'monaco-editor'

export { monaco };

function noop() {}


function createDependencyProposals(range, monaco, $store) {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup

    if($store.state.database.tables.length <= 0) {
      return []
    }

    let proposals = []
    for(var index in $store.state.database.tables) {
      const tableName = $store.state.database.tables[index]

      proposals.push({
        label: tableName,
        kind: monaco.languages.CompletionItemKind.Function,
        documentation: `Table named ${tableName}`,
        insertText: tableName,
        range: range
      })
    }

    return proposals

    /*return [
        {
            label: '"lodash"',
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "The Lodash library exported as Node.js modules.",
            insertText: '"lodash": "*"',
            range: range
        },
        {
            label: '"express"',
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Fast, unopinionated, minimalist web framework",
            insertText: '"express": "*"',
            range: range
        },
        {
            label: '"artists"',
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Recursively mkdir, like <code>mkdir -p</code>",
            insertText: 'artists',
            range: range
        },
        {
            label: '"users"',
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: "Describe your library here",
            insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
        }
    ];*/
}

export default {
  name: "MonacoEditor",

  props: {
    diffEditor: { type: Boolean, default: false },
    width: { type: [String, Number], default: "100%" },
    height: { type: [String, Number], default: "100%" },
    original: String,
    value: String,
    language: { type: String, default: "sql" },
    theme: { type: String, default: "vs-dark" },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    editorMounted: { type: Function, default: noop },
    editorBeforeMount: { type: Function, default: noop }
  },

  watch: {
    options: {
      deep: true,
      handler(options) {
        this.editor && this.editor.updateOptions(options);
      }
    },

    value() {
      this.editor &&
        this.value !== this._getValue() &&
        this._setValue(this.value);
    },

    language() {
      if (!this.editor) return;
      if (this.diffEditor) {
        const { original, modified } = this.editor.getModel();
        monaco.editor.setModelLanguage(original, this.language);
        monaco.editor.setModelLanguage(modified, this.language);
      } else {
        monaco.editor.setModelLanguage(this.editor.getModel(), this.language);
      }
    },

    theme() {
      this.editor && monaco.editor.setTheme(this.theme);
    },

    style() {
      this.editor &&
        this.$nextTick(() => {
          this.editor.layout();
        });
    }
  },

  computed: {
    style() {
      return {
        width: !/^\d+$/.test(this.width) ? this.width : `${this.width}px`,
        height: !/^\d+$/.test(this.height) ? this.height : `${this.height}px`
      };
    }
  },

  mounted() {
    monaco.languages.registerDocumentFormattingEditProvider("sql", {
      async provideDocumentFormattingEdits(model) {
        const sqlFormatter = await import("sql-formatter");
        const text = sqlFormatter.format(model.getValue());

        return [
          {
            range: model.getFullModelRange(),
            text
          }
        ];
      }
    });

    this.initMonaco();
    
    monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position) => {
        // find out if we are completing a property in the 'dependencies' object.
        var textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
        var match = textUntilPosition.match(/^SELECT(.*)$/);
        if (!match) {
            return { suggestions: [] };
        }
        var word = model.getWordUntilPosition(position);
        var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };
        return {
            suggestions: createDependencyProposals(range, monaco, this.$store)
        };
    }
});

monaco.editor.create(document.getElementById("container"), {
    value: "{\n\t\"dependencies\": {\n\t\t\n\t}\n}\n",
    language: "json"
});
  },

  beforeDestroy() {
    this.editor && this.editor.dispose();
  },

  methods: {
    handleResize() {
      console.log('HIT')
    },

    initMonaco() {
      const $self = this;
      const { value, language, theme, options } = this;
      Object.assign(options, this._editorBeforeMount());

      $self.editor = monaco.editor[
        $self.diffEditor ? "createDiffEditor" : "create"
      ]($self.$el, {
        value: value,
        language: language,
        theme: theme,
        automaticLayout: false,
        ...options
      });

      $self.editor.addAction({
        id: "run-sql-formatter",
        label: "Run SQL Formatter",
        keybindings: [
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_B
          )
        ],
        contextMenuGroupId: "navigation",
        run() {
          $self.editor.getAction("editor.action.formatDocument").run();
          return "";
        }
      });

      $self.editor.addAction({
        id: "toggle-results-panel",
        label: "Toggle Results Panel",
        keybindings: [
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.US_BACKTICK
          )
        ],
        contextMenuGroupId: "navigation",
        run() {
          $self.$store.commit('saveEditorTabContext', { tabIdx: $self.$store.state.viewingEditorTab, showResultsPanel: 'toggle' })
          return true;
        }
      });

      $self.editor.addAction({
        id: "run-sql",
        label: "Run SQL",
        keybindings: [
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
          ),
          monaco.KeyCode.F5
        ],
        contextMenuGroupId: "navigation",
        run() {
          $self.$emit("runSQL")
          return true;
        }
      });

      $self.editor.addAction({
        id: "new-editor-tab",
        label: "New Editor Tab",
        keybindings: [
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_T
          )
        ],
        contextMenuGroupId: "navigation",
        run() {
          $self.$emit("newEditorTab")
          return true;
        }
      });

      $self.diffEditor && $self._setModel($self.value, $self.original);
      $self._editorMounted($self.editor);
    },

    _getEditor() {
      if (!this.editor) return null;
      return this.diffEditor ? this.editor.modifiedEditor : this.editor;
    },

    _newModel () {
      this._setModel('', this.original)
    },

    _setModel(value, original) {
      const { language } = this;
      const modifiedModel = monaco.editor.createModel(value, language);
      if (original) {
        const originalModel = monaco.editor.createModel(original, language);
        this.editor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      } else {
        this.editor.setModel(modifiedModel);
      }
    },

    _setValue(value) {
      let editor = this._getEditor();
      if (editor) return editor.setValue(value);
    },

    _getValue() {
      let editor = this._getEditor();
      if (!editor) return "";
      return editor.getValue();
    },

    _editorBeforeMount() {
      const options = this.editorBeforeMount(monaco);
      return options || {};
    },

    _editorMounted(editor) {
      this.editorMounted(editor, monaco);
      if (this.diffEditor) {
        editor.onDidUpdateDiff(event => {
          const value = this._getValue();
          this._emitChange(value, event);
        });
      } else {
        editor.onDidChangeModelContent(event => {
          const value = this._getValue();
          this._emitChange(value, event);
        });
      }
    },

    _emitChange(value, event) {
      this.$emit("change", value, event);
      this.$emit("input", value);
    },
    _getSelectedText() {
      return this.editor.getModel().getValueInRange(this.editor.getSelection())
    }
  }
};
</script>
<style>
  .view-lines {
    text-align: left !important;
  }
</style>