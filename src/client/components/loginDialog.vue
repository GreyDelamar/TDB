<template>
  <v-dialog
    v-model="dialogTemp"
    persistent
    max-width="600px"
    :overlay-opacity="0.95"
  >
    <v-card @keyup.enter="submit">
      <v-card-title>
        <span class="headline">User Profile</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <!-- Server Type -->
              <v-combobox
                v-model="serverType"
                :items="serverTypes"
                label="Server Type"
                item-value="value"
                cols="4"
              ></v-combobox>
            </v-col>

            <!-- Server Hpst -->
            <v-col cols="8">
              <v-text-field
                v-model="server"
                label="Server"
                required
              ></v-text-field>
            </v-col>

            <!-- Username -->
            <v-col cols="12">
              <v-text-field
                v-model="username"
                label="Username"
                required
              ></v-text-field>
            </v-col>

            <!-- Password -->
            <v-col cols="12">
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
            </v-col>

            <!-- Alert: Invalid Login -->
            <v-alert type="error" v-if="error">
              Invalid Login
            </v-alert>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-bind:disabled="btnDisable" text @click="cancel">Cancel</v-btn>
        <v-btn v-bind:disabled="btnDisable" text @click="submit">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';

const serverTypes = [
  'mssql',
  'mysql'
]

export default {
  name: "loginDialog",

  props: {
    dialog: Boolean
  },

  data: () => ({
    server: "",
    serverType: "mssql",
    username: "",
    password: "",
    error: false,
    btnDisable: false,
    serverTypes
  }),

  mounted () {
    ipcRenderer.on('server:addConnection:result', this.connectionHandler)
  },

  beforeDestroy () {
    ipcRenderer.removeListener('server:addConnection:result', this.connectionHandler)
  },

  computed: {
    dialogTemp: {
      get() {
        return this.$props.dialog;
      },
      set(val) {
        this.$emit("update:dialog", val);
      }
    }
  },

  methods: {
    connectionHandler (e, data) {
      if (data.success && data.opts) {
        this.$store.dispatch('addNewServer', data.server)

        this.server = ""
        this.username = ""
        this.password = ""
        this.error = false
        this.btnDisable = false;

        this.dialogTemp = false
      } else {
        // error connecting to DB
        this.btnDisable = false
        this.error = true
      }
    },
    submit() {
      this.btnDisable = true;
      this.error = false;
      const $self = this;

      let data = {
        server: $self.server,
        serverType: this.serverType,
        username: $self.username,
        password: $self.password
      };

      ipcRenderer.send('server:addConnection', data)
    },
    cancel() {
      this.server = ""
      this.username = ""
      this.password = ""
      this.error = false
      this.btnDisable = false;
      this.$store.commit('showLogin', false)
    }
  }
};
</script>
