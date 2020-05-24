<template>
  <div class="monaco_editor_container" :style="style"></div>
</template>

<script>
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import sqlHighlight from "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";
// import commands from 'monaco-editor/esm/vs/editor/browser/editorExtensions.js';

export { monaco };

function noop() {}

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
        return { automaticLayout: true };
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
      async provideDocumentFormattingEdits(model, options, token) {
        const sqlFormatter = await import("sql-formatter");

        const text = sqlFormatter.format(model.getValue());

        debugger;

        return [
          {
            range: model.getFullModelRange(),
            text
          }
        ];
      }
    });

    this.initMonaco();
  },

  beforeDestroy() {
    this.editor && this.editor.dispose();
  },

  methods: {
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
          debugger;
          $self.editor.getAction("editor.action.formatDocument").run();
          return "";
        }
      });

      $self.diffEditor && $self._setModel($self.value, $self.original);
      $self._editorMounted($self.editor);
    },

    _getEditor() {
      if (!this.editor) return null;
      return this.diffEditor ? this.editor.modifiedEditor : this.editor;
    },

    _setModel(value, original) {
      const { language } = this;
      const originalModel = monaco.editor.createModel(original, language);
      const modifiedModel = monaco.editor.createModel(value, language);
      this.editor.setModel({
        original: originalModel,
        modified: modifiedModel
      });
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
      console.log("HIT");
      this.$emit("change", value, event);
      this.$emit("input", value);
    }
  }
};
</script>
