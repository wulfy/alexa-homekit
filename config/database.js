const mysql = require( 'mysql' );
const {DBCONFIG} = require('./constants')
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

console.log(DBCONFIG)
getDatabase = () => {
    if(database) return database;
    database = new Database(DBCONFIG);
    database.connect();
    return database;
};

getUserData = (token) => {
    console.log("GET USER DATA ");
    const connectionDatabase = getDatabase();
    return connectionDatabase.query(`SELECT * FROM oauth_tokens as ot 
                                     LEFT JOIN users as us ON ot.user_id = us.id 
                                     LEFT JOIN user_data as ud ON ud.user_id = ot.user_id 
                                     WHERE ot.access_token = ? `, 
    [token]).then( results => {
        console.log(results[0])
        let data = results[0];
        if(!data) 
            throw "ERROR NO TOKEN FOUND";

        return data;
    });
}

exports.getDatabase = getDatabase;
exports.getUserData = getUserData;

