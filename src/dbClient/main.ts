import connectionProvider, { connectionConfig } from '@db/connection-provider'

console.log('Starting Database Connection Provider')
const connPro = new connectionProvider()

connPro.addIPC('server:getDatabases', async (e: any, options: { [key: string]: any}) => {
  try {
    const client = await connPro.getConnection(<connectionConfig>options)
    let results = await client.getDatabases()
    connPro.send('server:getDatabases:result', { serverGuiID: options.guiID, results })
  } catch (error) {
    connPro.send('server:getDatabases:result', { serverGuiID: options.guiID, error })
  }
})

connPro.addIPC('server:getTables', async (e: any, options: { [key: string]: any}, databaseName: string, databaseGuiID: string) => {
  try {
    const client = await connPro.getConnection(<connectionConfig>options)
    let results = await client.getTables(databaseName)
    connPro.send('server:getTables:result', { serverGuiID: options.guiID, databaseGuiID, results })
  } catch (error) {
    connPro.send('server:getTables:result', { serverGuiID: options.guiID, databaseGuiID, error })
  }
})
