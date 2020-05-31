
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { v4 } from 'uuid';

import sqlServer from '@db/clients/sqlServer';
import mysqlServer from '@db/clients/mysqlServer';

export interface connectionConfig {
  server: string
  serverType: string,
  username: string
  password: string
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
      let conn = await this.addConnection(opts)

      ipcRenderer.send('server:addConnection:result', {
        success: conn.success,
        opts: {...opts, ...{ password: undefined }},
        server: { name: `${opts.server} - ${opts.username}`, guiID: opts.guiID, guiType: 'server', children: [ {name: "Loading..."} ], opts }
      })
    })
  }

  private cleanOpts (opts: connectionConfig) {
    opts.server = opts.server.trim()
    opts.username = opts.username.trim()
    opts.password = opts.password.trim()
    opts.user = opts.username.trim()
    return opts
  }

  private generateUUID () {
    return v4()
  }

  public async addConnection (opts: connectionConfig, forceGuiID?: string | undefined) {
    opts.guiID = forceGuiID ? forceGuiID : this.generateUUID()
    opts = this.cleanOpts(opts)

    // @TODO these two if's should be a switch statement
    // Handle MS SQL Connection Type
    if(opts.serverType == 'mssql') {
      let sql = new sqlServer(opts, opts.guiID)

      try {
        // test connection
        await sql.newConnection()
        this.connections[opts.guiID] = { config: opts, client: sql }
        return { success: true, message: "success" }
      } catch (err) {
        return { success: false, message: "fail" }
      }
    }

    // Handle MySQL Connection Type
    if (opts.serverType == 'mysql') {
      let mysql = new mysqlServer(opts, opts.guiID)

      let connection
      try {
        connection = await mysql.newConnection()
      } catch (err) {
        console.error(err)
        return { success: false, message: "fail" }
      }

      if (connection.state !== 'authenticated') {
        return { success: false, message: "fail" }
      }

      this.connections[opts.guiID] = { config: opts, client: mysql }
      return { success: true, message: "success" }
    }

    return { success: false, message: "fail" }
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

  public checkForConnection(guiID: string) {
    return this.connections[guiID]
  }

  public addIPC (channel: string, listener: (event: IpcRendererEvent, ...args: any[] )=>void) {
    ipcRenderer.on(channel, listener)
    return true
  }

  public send (channel: string, ...args: any[]) {
    ipcRenderer.send(channel, ...args)
  }

  public async close() {
    for (const pool of Object.values(this.connections)) {
      await pool.client.close()
    }

    return true
  }
}