const mysql = require( 'mysql' );
const crypto = require('crypto');
const {databaseLogger, debugLogger} = require('./logger.js');
const {DBCONFIG} = require('./constants')
const {sendStatsd} = require('./metrics');

let database = null;
class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    connect() {
        this.connection.connect(function(err) {
              if (err) {
                console.error('error connecting: ' + err.stack);
                return;
                  }
         
                console.log('connexion works , connected as id ' + this.connection.threadId);
            }.bind(this));
        }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

databaseLogger(DBCONFIG)
const getDatabase = () => {
    if(database) return database;
    database = new Database(DBCONFIG);
    database.connect();
    return database;
};

const getUserData = (token) => {
    databaseLogger("GET USER DATA ");
    sendStatsd("calls.database.getUserData:1|c");

    const connectionDatabase = getDatabase();
    return connectionDatabase.query(`SELECT * FROM oauth_tokens as ot
                                     LEFT JOIN users as us ON ot.user_id = us.id
                                     LEFT JOIN user_data as ud ON ud.user_id = ot.user_id
                                     WHERE ot.access_token = ? `,
    [token]).then( results => {
        debugLogger(results[0])
        let data = results[0];
        if(!data) {
            // Distinct from a generic DB error — this is an auth/lookup
            // miss, surfaced to NR as a non-fatal noticeError so it shows
            // up in TransactionError without crashing the handler.
            const err = new Error("ERROR NO TOKEN FOUND");
            require('newrelic').noticeError(err, { component: 'database', reason: 'unknown_token' });
            throw err;
        }

        // Identify the user behind this invocation. Using the DB id (not
        // the OAuth token) keeps us safe from leaking secrets to NR while
        // still enabling uniqueCount(alexa.userId) for DAU/MAU metrics.
        const nr = require('newrelic');
        if (data.user_id !== undefined) {
            nr.addCustomAttribute('alexa.userId', String(data.user_id));
        }
        // Also capture a stable per-user identifier so dashboards can
        // facet by user (top users, retention, per-user error rate, etc.).
        // We HASH the email rather than store it raw — the skill is now
        // open to the public so user emails are personal data we'd rather
        // not ingest into NR. SHA-256 truncated to 16 hex chars is more
        // than enough to keep all real users distinct (64 bits of entropy)
        // while not being reversible.
        const login = data.email || data.login || data.username || data.user_email || data.mail;
        if (login) {
            const hash = crypto.createHash('sha256').update(String(login)).digest('hex').substring(0, 16);
            nr.addCustomAttribute('alexa.userLogin', hash);
        }

        return data;
    }).catch(err => {
        // Catch connection errors / SQL errors that aren't the lookup miss
        // above. Re-throw so the caller's behavior is unchanged.
        if (err && err.message !== "ERROR NO TOKEN FOUND") {
            require('newrelic').noticeError(err, { component: 'database', reason: 'query_error' });
        }
        throw err;
    });
}

exports.getDatabase = getDatabase;
exports.getUserData = getUserData;