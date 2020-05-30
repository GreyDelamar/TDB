import { ConnectionPool, config, IRecordSet } from 'mssql';
import { connectionConfig } from '@db/connection-provider'

export default class sqlServer {
  public config: config
  private mainConnection: ConnectionPool | undefined
  private connection: ConnectionPool | undefined

  constructor (config: connectionConfig) {
    this.config = <config>config
  }

  public async newConnection (main: boolean) {
    if (!main) return await new ConnectionPool(this.config)
    this.mainConnection = await new ConnectionPool(this.config).connect()
  }

  public async getDatabases () {
    if (!this.mainConnection) await this.newConnection(true)

    return await this.mainConnection?.query(`
      SELECT
        create_date,
        database_id,
        name,
        service_broker_guid AS guiID
      FROM
          sys.databases
      WHERE
          name != 'master'
      AND
          name != 'tempdb'
      and
          name != 'model'
      and
          name != 'msdb'
      ORDER BY
          name
    `).then(d => {
      let result = d.recordset

      for (let i = 0; i < result.length; i++) {
        const el = result[i];

        el.guiType = 'database'
        el.children =  [{ "name":"Loading..." }]
      }

      return result
    });
  }

}


