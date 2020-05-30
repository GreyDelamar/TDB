import connectionProvider, { connectionConfig } from '@db/connection-provider'

console.log('Starting Database Connection Provider')
const connPro = new connectionProvider()

connPro.addIPC('server:getDatabases', async (e: any, options: { [key: string]: any}) => {
  const client = await connPro.getConnection(<connectionConfig>options)
  let results = await client.getDatabases()
  connPro.send('server:getDatabases:result', { guiID: options.guiID, results })
})
