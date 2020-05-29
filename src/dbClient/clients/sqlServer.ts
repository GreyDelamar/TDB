import { ConnectionPool, config } from 'mssql';
import { connectionConfig } from '@db/connection-provider'

export default class sqlServer {
  config: config
  mainConnection: ConnectionPool | undefined
  connection: ConnectionPool | undefined

  constructor (config: connectionConfig) {
    this.config = <config>config
  }

  public async newConnection (main: boolean) {
    if (!main) this.connection = await new ConnectionPool(this.config)
    else this.mainConnection = await new ConnectionPool(this.config).connect()
  }

  public async getDatabases () {
    console.log('GETTING DATABASES')

    let result = await this.mainConnection?.query(`
      SELECT
          *
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
    `);

    console.log(result)
  }

}