"use strict";

import connectionProvider, { connectionConfig } from '@db/connection-provider'
import { ipcRenderer } from 'electron';

// log to main proccess so we can see the logs
console.log = function () {
  var args = [].slice.call(arguments);
  ipcRenderer.send('log:main', ...args)
}

console.log('Starting Database Connection Provider')
const connPro = new connectionProvider()

connPro.addIPC('server:getDatabases', async (e: any, options: connectionConfig) => {
  try {
    const client = await connPro.getConnection(options)
    let results = await client.getDatabases()
    connPro.send('server:getDatabases:result', { serverGuiID: options.guiID, results })
  } catch (error) {
    connPro.send('server:getDatabases:result', { serverGuiID: options.guiID, error })
  }
})

connPro.addIPC('server:getTables', async (e: any, options: connectionConfig, databaseName: string, databaseGuiID: string) => {
  try {
    const client = await connPro.getConnection(options)
    let results = await client.getTables(databaseName, databaseGuiID)
    connPro.send('server:getTables:result', { serverGuiID: options.guiID, databaseGuiID, results })
  } catch (error) {
    connPro.send('server:getTables:result', { serverGuiID: options.guiID, databaseGuiID, error })
  }
})

connPro.addIPC('server:getColumns', async (e: any, options: connectionConfig, table: { [key: string]: any}) => {
  try {
    const client = await connPro.getConnection(options)
    let results = await client.getColumns(table.databaseName, table.databaseGuiID, table.name, table.guiID)

    connPro.send('server:getColumns:result', {
      serverGuiID: options.guiID,
      databaseGuiID: table.databaseGuiID,
      tableGuiID: table.guiID,
      results
    })
  } catch (error) {
    connPro.send('server:getColumns:result', {
      serverGuiID: options.guiID,
      databaseGuiID: table.databaseGuiID,
      tableGuiID: table.guiID,
      error
    })
  }
})

connPro.addIPC('server:removeConnection', async (e: any, options: connectionConfig) => {
  try {
    if (connPro.checkForConnection(options.guiID)) {
      const client = await connPro.getConnection(options)
      await client.close()
    }
  } catch (error) {
    console.log(error)
  }
})

connPro.addIPC('server:runQuery', async (e: any, options: connectionConfig, editorGuiID: string, query: string) => {
  let RanAt = new Date()
  try {
    const client = await connPro.getConnection(options)
    let results = await client.runQuery(query)
    results.localRanAt = RanAt
    connPro.send('server:runQuery:result', { serverGuiID: options.guiID, editorGuiID, results })
  } catch (error) {
    error.error = true //- easy frontend check
    error.localRanAt = RanAt
    connPro.send('server:runQuery:result', { serverGuiID: options.guiID, editorGuiID, error })
  }
})

// Hope this will kill the DB on dev hot reloads
window.addEventListener('beforeunload', async () => {
  await connPro.close()
});
