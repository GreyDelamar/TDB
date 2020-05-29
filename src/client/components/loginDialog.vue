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
            <v-col cols="12">
              <v-text-field
                v-model="server"
                label="Server"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="username"
                label="Username"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="submit">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  name: "menuSearch",

  props: {
    dialog: Boolean
  },

  data: () => ({
    server: "",
    username: "",
    password: ""
  }),

  mounted () {
    ipcRenderer.on('server:addConnection:result', (e, data) => {
      if (data.success && data.opts) {
        this.$store.commit('serverAdd', data.server)
        this.$store.commit('connectionAdd', data.opts)

        this.dialogTemp = false
      }
    })
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
    submit() {
      const $self = this;
      let data = {
        server: $self.server,
        username: $self.username,
        password: $self.password
      };

      ipcRenderer.send('server:addConnection', data)
    }
  }
};
</script>
