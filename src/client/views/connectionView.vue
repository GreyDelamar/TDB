<template>
    <v-container>
        <v-row>
            <v-col v-if="servers.length <= 0">
                <h1 class="white--text text--lighten-5">No connections available...</h1 >
                <h3 class="white--text text--lighten-5 mt-2">Click add connection to get started</h3>
            </v-col>
            <v-col cols=3 v-for="server in this.servers" :key="server.guID">

                <!-- Connection Card -->
                <v-card
                    dark
                    
                    elevation=10
                    class="pa-2"
                    tile
                    border="left"
                    
                >
                    <!-- Connection Name -->
                    <v-card-title class="headline mb-1">{{ server.name }}</v-card-title>
                    <!-- Username -->
                    <v-card-text class="mt-0 pt-0"><i class="fas fa-user mr-2"></i> {{ server.opts.username }}</v-card-text>
                    <!-- Server -->
                    <v-card-text class="mt-0 pt-0"><i class="fas fa-server mr-2"></i>{{ server.opts.server }}</v-card-text>
                    <!-- Type -->
                    <v-card-text class="mt-0 pt-0"><i class="fas fa-database mr-2"></i> {{ server.opts.serverType }}</v-card-text>

                    <v-card-actions>
                        <v-btn text color="success" @click="handleServerConnect(server.guiID)">Connect</v-btn>
                        <v-btn text color="red accent-3" @click="handleServerRemove(server.guiID)">Remove</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component({
    
})
export default class ConnectionView extends Vue {
    constructor() {
        super();
    }

    handleServerConnect(serverGuid) {
        this.$store.dispatch('connectServer', serverGuid)
    }

    handleServerRemove(serverGuid) {
        this.$store.dispatch('removeServer', serverGuid)
    }

    get servers () {
        return this.$store.state.servers
    }
}
</script>