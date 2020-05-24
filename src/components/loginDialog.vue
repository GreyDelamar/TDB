<template>
  <v-dialog
    v-model="dialogTemp"
    persistent
    max-width="600px"
    :overlay-opacity="0.95"
  >
    <template v-slot:activator="{ on }">
      <v-btn color="primary" dark v-on="on">Open Dialog</v-btn>
    </template>
    <v-card>
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
import { mapState } from "vuex";

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

      $self.$http.post("http://localhost:3000/login", data).then(d => {
        if (d.data.token) {
          $self.$store.commit("serverAdd", d.data);
          $self.$store.commit("showLogin", false);
        }
      });
    }
  }
};
</script>
