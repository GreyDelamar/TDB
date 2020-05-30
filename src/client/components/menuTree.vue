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
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on">
            {{ "fa-" + item.guiType }}
          </v-icon>
        </template>
        <span style="text-transform: capitalize;">{{ item.guiType === 'columns' ? 'column' : item.guiType }}</span>
      </v-tooltip>
    </template>

    <template v-slot:append="{ item }">
      <!-- column text -->
      <small v-if="item.guiType === 'columns'">
        (
        <span v-if="item.hasOwnProperty('constraintType')">{{ constraintText(item.constraintType) }}</span>
        <span v-if="item.hasOwnProperty('dataType')">{{ item.dataType + ", "}}</span>
        <span v-if="item.hasOwnProperty('nullable')">{{ item.nullable ? "Null" : "Not Null" }}</span>
        )
      </small>

      <!-- disconnect -->
      <v-tooltip v-if="item.guiType === 'server'" top>
        <template v-slot:activator="{ on }">
          <v-btn @click.stop="disconnect(item)" v-on="on" text small>
            <v-icon style="font-size: 16px;">fa-unlink</v-icon>
          </v-btn>
        </template>
        <span>Disconnect</span>
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
        $self.columnCalled[data.serverGuiID] = undefined
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
        $self.columnCalled[data.databaseGuiID] = undefined
        console.log(data.error)
      }
    })


    ipcRenderer.on('server:getColumns:result', (e, data) => {
      if (data.results) {
       const server = $self.local_data[data.serverGuiID] || {}
       const sChildren = server.children || []
       const database = sChildren.find(d => d.guiID === data.databaseGuiID) || {}
       const dChildren = database.children || []
       const target = dChildren.find(d => d.guiID === data.tableGuiID) || {}

       target.children = [...data.results]
      } else if (data.error) {
        $self.columnCalled[data.databaseGuiID] = undefined
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
                $self.getColumns($self, key, el);
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
    async getColumns(target, key, table) {
      const server = target.local_data[key];
      ipcRenderer.send('server:getColumns', server.opts, {...table, ...{ children: undefined }}) //- don't update the pointer
    },
    constraintText(constraintType) {
      if (constraintType === "PRIMARY KEY") return "PK, ";
      else if (constraintType === "FOREIGN KEY") return "FK, ";
      else return "";
    },
    disconnect(val) {
      this.$store.commit('serverRemove', val.guiID)
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
