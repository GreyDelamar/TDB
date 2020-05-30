
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { v4 } from 'uuid';

import sqlServer from '@db/clients/sqlServer';

export interface connectionConfig {
  server: string
  username: string
  user: string
  guiID: string
  port: number
  database: string
}

export interface connection {
  config: connectionConfig
  client: sqlServer
}

export interface connections {
  [key: string]: any
}

export default class connectionProvider {
  connections: connections

  constructor () {
    this.connections = {}
    this.start()
  }

  private start () {
    this.addIPC('server:addConnection', async (e:any, opts:any) => {
      await this.addConnection(opts)

      ipcRenderer.send('server:addConnection:result', {
        success: true,
        opts: {...opts, ...{ password: undefined }},
        server: { name: `${opts.server} - ${opts.username}`, guiID: opts.guiID, guiType: 'server', children: [ {name: "Loading..."} ], opts }
      })
    })
  }

  private cleanOpts (opts: connectionConfig) {
    opts.server = opts.server.trim()
    opts.username = opts.username.trim()
    opts.user = opts.username.trim()
    return opts
  }

  private generateUUID () {
    return v4()
  }

  public async addConnection (opts: connectionConfig, forceGuiID?: string | undefined) {
    opts.guiID = forceGuiID ? forceGuiID : this.generateUUID()
    opts = this.cleanOpts(opts)

    let sql = new sqlServer(opts, opts.guiID)
    // test connection
    const conn = await sql.newConnection()
    await conn.close()

    this.connections[opts.guiID] = { config: opts, client: sql }
  }

  public async getConnection (opts: connectionConfig) {
    const guiID = opts.guiID;
    let connection = <connection>this.connections[guiID]

    if (!this.connections[guiID]) {
      await this.addConnection(opts, guiID)
      connection = this.connections[guiID]
    }

    return connection.client
  }

  public addIPC (channel: string, listener: (event: IpcRendererEvent, ...args: any[] )=>void) {
    ipcRenderer.on(channel, listener)
    return true
  }

  public send (channel: string, ...args: any[]) {
    ipcRenderer.send(channel, ...args)
  }
}