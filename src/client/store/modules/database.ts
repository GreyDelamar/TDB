
export default {
    namespaced: true,
    state: {
        databases: [],
        columns: [],
        tables: []
    },
    mutations: {
        setDatabase(state, { serverGuiID, databases }) {
            console.log(databases)
            //state.databases[serverGuiID] = databases
        },
        setTables(state, tables) {
            for(var index in tables) {
                const tableName = tables[index].name

                state.tables.push(tableName)
            }
        }
    }
}