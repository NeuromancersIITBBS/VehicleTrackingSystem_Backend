const fs = require('fs').promise;

let updateDriversInDB  =  function (driverList){
    return  fs.writeFile('../DriverData/DriverList.txt', 'utf-8', JSON.stringify(driverList));
};

module.exports.updateDriversInDB = updateDriversInDB;
