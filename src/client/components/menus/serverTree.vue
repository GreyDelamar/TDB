<template>
  <div style="position: relative">
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

      <template v-slot:label="{ item }">
        <div @contextmenu="showRightClickMenu($event, item)">{{ item.name }}</div>
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
    <v-menu v-model="showMenu" :position-x="menuX" :position-y="menuY" absolute offset-y>
      <v-list class="pa-0">
        <v-list-item class="pa-0">
          <v-btn @click="newEditorTab" text>New Editor Tab</v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { ipcRenderer } from 'electron';

export default {
  name: "serverTree",

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

        $self.$store.commit('database/setTables', data.results)

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
    columnCalled: {},
    showMenu: false,
    menuX: 0,
    menuY: 0,
    menuContext: null
  }),

  methods: {
    newEditorTab () {
      console.log(this.menuContext)
      const server = this.$store.state.servers.find(d => d.guiID === this.menuContext.serverGuiID || this.menuContext.guiID)
      this.$store.commit('addEditorTab', server)
    },
    showRightClickMenu (e, item) {
      this.menuX = e.x
      this.menuY = e.y
      this.showMenu = true,
      this.menuContext = item
    },
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
      ipcRenderer.send('server:removeConnection', val)
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

<style lang="scss" scoped>
.v-treeview-node__append {
  small {
    font-size: 75%;
  }
}
</style>
