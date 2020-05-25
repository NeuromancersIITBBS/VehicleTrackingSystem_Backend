const sqlite3 = require('sqlite3').verbose()

class Database{
    constructor(DBSOURCE){
        const driverSchema = `id INTEGER PRIMARY KEY AUTOINCREMENT,
        driverName TEXT NOT NULL,
        phoneNumber DECIMAL(10,0) UNIQUE, 
        password TEXT NOT NULL,
        isActive BIT DEFAULT 0`; 

        this.db = new sqlite3.Database(DBSOURCE, (err) => {
            if (err) {
              // Cannot open database
              console.error(err.message);
            }else{
                console.log('Connected to the SQLite database.')
                this.db.run(`CREATE TABLE IF NOT EXISTS drivers (${driverSchema})`);
            }
        });
    }

    query(sqlQuery, params){
        var that = this;
        return new Promise(function (resolve, reject) {
            that.db.all(sqlQuery, params, function (error, rows) {
            if (error)
                reject(error);
            else
                resolve({ data: rows });
            });
        });
    }

    getAllDrivers(){
        return this.query('SELECT * FROM drivers');
    }

    addDriver(driver){
        const queryParams = [driver.driverName, driver.phoneNumber, driver.password];
        return this.query('INSERT INTO drivers (driverName, phoneNumber, password) VALUES (?, ?, ?)', queryParams);
    }

    getDriver(phoneNumber){
        const queryParams = [phoneNumber];
        return this.query('SELECT * FROM drivers WHERE phoneNumber = ?', queryParams)
    }

    deleteDriver(phoneNumber){
        const queryParams = [phoneNumber];
        return this.query('DELETE FROM drivers WHERE phoneNumber = ?', queryParams);
    }

    updateDriver(phoneNumber, newData){
        const updateList = Object.keys(newData).map(key => `${key} =  '${newData[key]}'`).join(', ');
        const query = `UPDATE drivers
        SET ${updateList}
        WHERE phoneNumber = ${phoneNumber}`;
        return this.query(query);
    }

    setActiveStatus(phoneNumber, status){
        const query = `UPDATE drivers
        SET isActive = '${status ? 1:0}'
        WHERE phoneNumber = ${phoneNumber}`;
        return this.query(query);   
    }
};

const DBSOURCE = "./DriverData/db.sqlite"
const db = new Database(DBSOURCE);

module.exports = db;