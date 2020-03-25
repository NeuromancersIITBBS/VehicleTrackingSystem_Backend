const fs = require('fs').promises;

let updateDriversInDB  = function (driverList){

    try {
        let data = JSON.stringify(driverList)
        return  fs.writeFile('./DriverData/DriverList.txt', data, 'utf8');
    }catch(err){
        console.log("An error occured while writing to the database");
        throw err;
    }
};

let readDriversFromDB = () => {
    try{
        return fs.readFile('./DriverData/DriverList.txt', 'utf8');
    } catch(err){
        console.log("An error occured while reading the database");
        throw err;
    }
};

module.exports.updateDriversInDB = updateDriversInDB;
module.exports.readDriversFromDB = readDriversFromDB;
