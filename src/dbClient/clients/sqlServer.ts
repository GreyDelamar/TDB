import * as sql from 'mssql';
import { connectionConfig } from '@db/connection-provider'

export default class sqlServer {
  public config: sql.config
  private pool: sql.ConnectionPool
  private poolConnect: Promise<sql.ConnectionPool>
  public guiID: string

  constructor (config: connectionConfig, guiID: string) {
    this.config = <sql.config>config
    this.guiID = guiID
    this.pool = new sql.ConnectionPool(this.config);
    this.pool.on('error', err => {
      console.log('getting db error: ')
      console.log(err)
    })
    this.poolConnect = this.pool.connect()
  }

  public async newConnection (): Promise<sql.Request> {
    await this.poolConnect
    return this.pool.request();
  }

  public close () {
    return this.pool.close()
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

      return result
    });
  }

  public async getTables (databaseName: string, databaseGuiID: string) {
    const conn = await this.newConnection()

    return conn.batch(`
      SET NOCOUNT ON
      DECLARE @result table (databaseName sysname, schemaName sysname, name sysname)
      DECLARE
          @SearchDb nvarchar(200)
          ,@SearchSchema nvarchar(200)
          ,@SearchTable nvarchar(200)
          ,@SQL nvarchar(4000)
      SET @SearchDb='${databaseName}'
      SET @SearchSchema='%'
      SET @SearchTable='%'
      SET @SQL='select ''?'' as dbName, s.name as schemaName, t.name as TableName from [?].sys.tables t inner join sys.schemas s on t.schema_id=s.schema_id WHERE ''?'' != "master" AND ''?'' != "msdb" AND ''?'' != "tempdb" AND ''?'' != "model" AND ''?'' LIKE '''+@SearchDb+''' AND s.name LIKE '''+@SearchSchema+''' AND t.name LIKE '''+@SearchTable+''''

      INSERT INTO @result (databaseName, schemaName, name)
          EXEC sp_msforeachdb @SQL
      SET NOCOUNT OFF

      SELECT *, NEWID() AS guiID FROM @result ORDER BY databaseName, schemaName, name
    `).then(async d => {
      let result = d.recordset

      for (let i = 0; i < result.length; i++) {
        const el = result[i];

        el.guiType = 'table'
        el.children =  [{ "name":"Loading..." }]
        el.serverGuiID = this.guiID
        el.databaseGuiID = databaseGuiID
      }

      return result
    });
  }

  public async getColumns (databaseName: string, databaseGuiID: string, tableName: string, tableGuiID: string) {
    const conn = await this.newConnection()

    return conn.batch(`
      USE [${databaseName}]

      SELECT
          OBJECT_SCHEMA_NAME (c.object_id) schemaName,
          o.Name AS tableName,
          con.CONSTRAINT_TYPE AS constraintType,
          c.Name AS name,
          c.is_nullable AS nullable,
          t.Name AS dataType,
          t.max_length AS lengthSize,
          t.precision AS precision,
          NEWID() AS guiID

      FROM
          sys.columns c
      INNER JOIN
          sys.objects o ON o.object_id = c.object_id
      LEFT JOIN
          sys.types t ON t.user_type_id = c.user_type_id
      LEFT JOIN
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE i ON o.Name = i.TABLE_NAME
                                                AND C.Name = i.COLUMN_NAME
      LEFT JOIN
          INFORMATION_SCHEMA.TABLE_CONSTRAINTS con ON i.CONSTRAINT_NAME = con.CONSTRAINT_NAME

      WHERE
          o.Type = 'U'
      AND
          o.Name = '${tableName}'

      ORDER BY
          con.CONSTRAINT_TYPE desc,
          c.Name
    `).then(async d => {
      let result = d.recordset

      for (let i = 0; i < result.length; i++) {
        const el = result[i];

        el.guiType = 'columns'
        el.serverGuiID = this.guiID
        el.databaseGuiID = databaseGuiID
        el.tableGuiID = tableGuiID
      }

      return result
    });
  }

  public async runQuery (query: string): Promise<sql.IResult<unknown> | undefined> {
    const conn = await this.newConnection();

    let t = <sql.IResult<unknown> | undefined>await new Promise((res, rej) => {
      conn.query(query, (err, data) => {
        if (err) rej(err)
        else {
          res(data)
        }
      })
    });

    return t
  }

}
