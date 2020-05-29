import connectionProvider from '@db/connection-provider'
import { ipcRenderer } from 'electron';


console.log('Starting Database Connection Provider')
const connPro = new connectionProvider()

connPro.addIPC('server:getDatabases', (e, server) => {
  console.log('SERVER', server)
})
