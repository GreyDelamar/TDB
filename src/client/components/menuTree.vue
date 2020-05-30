<template>
  <v-treeview
    dense
    :items="servers"
    @update:open="open"
    item-key="guiID"
    hoverable
    open-on-click
    :search="searchTerm"
    :filter="mainfilter"
    return-object
  >
    <template v-slot:prepend="{ item }">
      <v-icon>
        {{ "fa-" + item.guiType }}
      </v-icon>
    </template>
    <template v-slot:append="{ item }">
      <small v-if="item.hasOwnProperty('nullable')">
        (
        <span v-if="item.hasOwnProperty('constraintType')">{{
          constraintText(item.constraintType)
        }}</span>
        <span v-if="item.hasOwnProperty('dataType')">{{
          item.dataType + ", "
        }}</span>
        <span v-if="item.hasOwnProperty('nullable')">{{
          item.nullable ? "Null" : "Not Null"
        }}</span>
        )
      </small>

      <v-tooltip v-if="item.type === 'server'" top>
        <template v-slot:activator="{}">
          <v-btn @click="disconnect" text>
            <v-icon>{{ "fa-unlink" }}</v-icon>
          </v-btn>
        </template>
        <span>Left tooltip</span>
      </v-tooltip>
    </template>
  </v-treeview>
</template>

<script>
import { mapState } from "vuex";
import { ipcRenderer } from 'electron';

export default {
  name: "menuTree",

  props: {
    searchTerm: String
  },

  mounted() {
    const $self = this;

    if (this.servers && this.servers.length) {
      for (let i = 0; i < this.servers.length; i++) {
        const el = this.servers[i];
        if (!$self.local_data[el.guiID]) $self.local_data[el.guiID] = el;
      }
    }

    ipcRenderer.on('server:getDatabases:result', (e, data) => {
      if (data.results) {
        $self.local_data[data.serverGuiID].children = [...data.results]
      } else if (data.error) {
        console.log(data.error)
      }
    })

    ipcRenderer.on('server:getTables:result', (e, data) => {

      if (data.results) {
       const server = $self.local_data[data.serverGuiID] || {}
       const children = server.children || []
       const target = children.find(d => d.guiID === data.databaseGuiID) || {}

       target.children = [...data.results]
      } else if (data.error) {
        console.log(data.error)
      }
    })
  },

  data: () => ({
    local_data: {},
    columnCalled: {}
  }),

  methods: {
    toObject(arr) {
      return arr.reduce(function(acc, cur) {
        acc[cur.key] = cur;
        return acc;
      }, {});
    },
    open(d) {
      const $self = this;

      if (d.length > 0) {
        for (let i = 0; i < d.length; i++) {
          const el = d[i];
          const guiID = el.guiID;
          const serverGuiID = el.serverGuiID;
          const type = el.guiType;

          if (!$self.columnCalled[guiID]) {
            $self.columnCalled[guiID] = true;

            let key = serverGuiID || guiID;
            switch (type) {
              case "server":
                $self.getDatabases(key);
                break;
              case "database":
                $self.getTables(key, el.name, guiID);
                break;
              case "table":
                $self.getColumns(key);
                break;
            }
          }
        }
      }
    },
    async getDatabases(key) {
      const server = this.local_data[key];
      ipcRenderer.send('server:getDatabases', server.opts)
    },
    async getTables(key, databaseName, databaseGuiID) {
      const server = this.local_data[key];
      ipcRenderer.send('server:getTables', server.opts, databaseName, databaseGuiID)
    },
    async getColumns(tableName) {
      const $self = this;
      const target = $self.local_data[tableName];
      const db = $self.local_data[target.dbKey];
      const server = $self.local_data[target.serverKey];

      let columns = await $self.$http
        .get(
          `http://localhost:3000/database/${db.name}/table/${target.name}/column/list`,
          { headers: { token: server.token } }
        )
        .then(d => d.data);
      let TB = $self.servers
        .find(d => d.key === target.serverKey)
        .children.find(d => d.key === target.dbKey)
        .children.find(d => d.key === target.key);

      TB.children = columns;
      $self.local_data = { ...$self.local_data, ...$self.toObject(columns) };
    },
    constraintText(constraintType) {
      if (constraintType === "PRIMARY KEY") return "PK, ";
      else if (constraintType === "FOREIGN KEY") return "FK, ";
      else return "";
    },
    disconnect() {
      console.log("disconnect");
    }
  },

  computed: {
    mainfilter() {
      return this.caseSensitive
        ? (item, search, textKey) => item[textKey].indexOf(search) > -1
        : undefined;
    },
    ...mapState(["servers"])
  },

  watch: {
    servers(val) {
      const $self = this;
      for (let i = 0; i < val.length; i++) {
        const el = val[i];
        if (!$self.local_data[el.guiID]) $self.local_data[el.guiID] = el;
      }
    }
  }
};
</script>
