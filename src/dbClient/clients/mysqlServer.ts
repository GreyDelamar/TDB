import mysql from 'mysql'
import { connectionConfig } from '@db/connection-provider'

export default class mysqlServer {
    private pool: mysql.Pool
    public guiID: string
    public config: connectionConfig

    constructor(config: connectionConfig, guiID: string) {
        this.guiID = guiID
        this.config = config

        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: this.config.server,
            user: this.config.username,
            password: this.config.password,
            // database: 'my_db'
        })
    }

    public newConnection(): Promise<mysql.PoolConnection> {

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    return reject(err)
                }

                resolve(connection)
            })
        })
    }

    public close() {
        // return this.connection.end();
    }

    public async getDatabases() {}
    public async getTables(databaseName: string, databaseGuiID: string) {}
    public async getColumns(databaseName: string, databaseGuiID: string, tableName: string, tableGuiID: string) {}
}