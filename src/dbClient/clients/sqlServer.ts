import { ConnectionPool, config, IRecordSet } from 'mssql';
import { connectionConfig } from '@db/connection-provider'

export default class sqlServer {
  public config: config
  private connection: ConnectionPool | undefined
  public guiID: string
  private reconnectAttempts: number

  constructor (config: connectionConfig, guiID: string) {
    this.config = <config>config
    this.guiID = guiID
    this.reconnectAttempts = 0
  }

  public async newConnection (): Promise<ConnectionPool> {
    const connConf = await new ConnectionPool(this.config)
    const conn = await connConf.connect()
    const result = await conn.query`select 1 AS res`

    if (result.recordset[0].res === 1 && this.reconnectAttempts <= 3) {
      this.reconnectAttempts = 0
      return conn
    } else if (this.reconnectAttempts >= 3) {
      throw new Error(`Can't connect to the database...`)
    }

    this.reconnectAttempts = this.reconnectAttempts + 1
    return this.newConnection()
  }

  public async getDatabases () {
    const conn = await this.newConnection()

    return conn.query(`
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
    `).then(async d => {
      let result = d.recordset

      for (let i = 0; i < result.length; i++) {
        const el = result[i];

        el.guiType = 'database'
        el.children =  [{ "name":"Loading..." }]
        el.serverGuiID = this.guiID
      }

      await conn.close()
      return result
    });
  }

  public async getTables (databaseName: string) {
    const conn = await this.newConnection()

    return conn.batch(`
      SET NOCOUNT ON
      DECLARE @result table (dbName sysname, schemaName sysname, name sysname)
      DECLARE
          @SearchDb nvarchar(200)
          ,@SearchSchema nvarchar(200)
          ,@SearchTable nvarchar(200)
          ,@SQL nvarchar(4000)
      SET @SearchDb='${databaseName}'
      SET @SearchSchema='%'
      SET @SearchTable='%'
      SET @SQL='select ''?'' as dbName, s.name as schemaName, t.name as TableName from [?].sys.tables t inner join sys.schemas s on t.schema_id=s.schema_id WHERE ''?'' != "master" AND ''?'' != "msdb" AND ''?'' != "tempdb" AND ''?'' != "model" AND ''?'' LIKE '''+@SearchDb+''' AND s.name LIKE '''+@SearchSchema+''' AND t.name LIKE '''+@SearchTable+''''

      INSERT INTO @result (dbName, schemaName, name)
          EXEC sp_msforeachdb @SQL
      SET NOCOUNT OFF

      SELECT *, NEWID() AS guiID FROM @result ORDER BY dbName, schemaName, name
    `).then(async d => {
      let result = d.recordset

      for (let i = 0; i < result.length; i++) {
        const el = result[i];

        el.guiType = 'table'
        el.children =  [{ "name":"Loading..." }]
      }

      await conn.close()
      return result
    });
  }

}


// COLUMN QUERY
// EXECUTE AS LOGIN = '${request.headers.username}'
// USE [${params.dbID}]

// SELECT
//     OBJECT_SCHEMA_NAME (c.object_id) SchemaName,
//     o.Name AS Table_Name,
//     con.CONSTRAINT_TYPE AS constraintType,
//     c.Name AS name,
//     c.is_nullable AS nullable,
//     t.Name AS dataType,
//     t.max_length AS Length_Size,
//     t.precision AS Precision

// FROM
//     sys.columns c
// INNER JOIN
//     sys.objects o ON o.object_id = c.object_id
// LEFT JOIN
//     sys.types t ON t.user_type_id = c.user_type_id
// LEFT JOIN
//     INFORMATION_SCHEMA.KEY_COLUMN_USAGE i ON o.Name = i.TABLE_NAME
//                                           AND C.Name = i.COLUMN_NAME
// LEFT JOIN
//     INFORMATION_SCHEMA.TABLE_CONSTRAINTS con ON i.CONSTRAINT_NAME = con.CONSTRAINT_NAME

// WHERE
//     o.Type = 'U'
// AND
//     o.Name = '${params.tbID}'

// ORDER BY
//     con.CONSTRAINT_TYPE desc,
//     c.Name