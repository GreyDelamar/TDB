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
        if (!$self.local_data[el.key]) $self.local_data[el.key] = el;
      }
    }
  },

  updated() {
    const $self = this;

    if (this.servers && this.servers.length) {
      for (let i = 0; i < this.servers.length; i++) {
        const el = this.servers[i];
        if (!$self.local_data[el.key]) $self.local_data[el.key] = el;
      }
    }
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
          const key = d[i];

          if (!$self.columnCalled[key]) {
            $self.columnCalled[key] = true;
            let type = $self.local_data[key].type;

            switch (type) {
              case "server":
                $self.getDatabases(key);
                break;
              case "database":
                $self.getTables(key);
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
      const $self = this;
      const server = $self.local_data[key];

      let DBs = await $self.$http
        .get(`http://localhost:3000/database/list`, {
          headers: { token: server.token }
        })
        .then(d => d.data);
      let sr = $self.servers.find(d => d.key === key);

      DBs.map(d => (d.serverKey = key));
      sr.children = DBs;
      $self.local_data = { ...$self.local_data, ...$self.toObject(DBs) };
    },
    async getTables(key) {
      const $self = this;
      const db = $self.local_data[key];
      const server = $self.local_data[db.serverKey];

      let tables = await $self.$http
        .get(`http://localhost:3000/database/${key}/table/list`, {
          headers: { token: server.token }
        })
        .then(d => d.data);
      let DB = $self.servers
        .find(d => d.key === db.serverKey)
        .children.find(d => d.key === key);
      tables.map(d => {
        d.dbKey = key;
        d.serverKey = db.serverKey;
      });
      DB.children = tables;
      $self.local_data = { ...$self.local_data, ...$self.toObject(tables) };
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
