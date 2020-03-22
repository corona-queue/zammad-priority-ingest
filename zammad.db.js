const superagent = require('pg');
const { Pool, Client } = require('pg')


class ZammadDB {
    constructor() {
        this.db_host = process.env.ZAMMAD_DB_HOST || "localhost";
        this.db_name = process.env.ZAMMAD_DB_NAME || "zammad";
        this.db_user = process.env.ZAMMAD_DB_USER || "root";
        this.db_password = process.env.ZAMMAD_DB_PASSWORD;
        this.db_port = parseInt(process.env.ZAMMAD_DB_PORT) || 5432;
        this.pool = new Pool({
            user: this.db_user,
            host: this.db_host,
            database: this.db_name,
            password: this.db_password,
            port: this.db_port,
        })
        console.debug("Connecting to zammad db " + this.db_host);
    }

    getPosition(ticketId) {
        return new Promise((resolve, reject) => {
            this.pool.query({text: `WITH summary AS (
            SELECT t.id,
                   ROW_NUMBER() OVER(ORDER BY t.med_prio DESC) AS position
              FROM tickets t WHERE t.state_id IN (1,2))
         SELECT s.*
           FROM summary s
          WHERE s.id = $1;`, values: [ticketId]}, (err, result) => {
                if (err) {
                    return reject(Error(err.message))
                }
                if (result.rows.length) {
                    return resolve(parseInt(result.rows[0].position))
                }
                return resolve(-1)
            })
        })
    }
}

module.exports = ZammadDB;
