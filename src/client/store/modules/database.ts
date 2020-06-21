
export default {
    namespaced: true,
    state: {
        databases: [],
        columns: [],
        tables: []
    },
    mutations: {
        setDatabase(state: any, { serverGuiID, databases }: any) {
            console.log(databases)
            //state.databases[serverGuiID] = databases
        },
        setTables(state: any, tables: any) {
            for(var index in tables) {
                const tableName = tables[index].name

                state.tables.push(tableName)
            }
        }
    }
}