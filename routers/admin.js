const adminRouter = require('express').Router();
let driverList = require('./driverCreationRouter').driverList;
let requestDriverList = require('./driverCreationRouter').requestDriverList;
let driverUtils = require('../utils/DriverCreationUtils');
let  Driver = require('./driverCreationRouter').Driver;


adminRouter.get('/allDrivers',(req,res)=>{
    console.log('All Drivers');
    console.log(driverList);
   res.status(200).send(driverList);
});

adminRouter.get('/getRequestedDrivers',(req,res)=>{
    res.send(requestDriverList)
});

adminRouter.post('/DriverVerified',async (req,res)=>{
    let verifiedDriverList = req.body.verifiedDriverList;
    for (const driver of verifiedDriverList){
        requestDriverList.filter((requestedDriver)=>requestedDriver.phoneNumber == driver.phoneNumber);
        let newDriver = new Driver(driver.driverName, driver.phoneNumber,driver.password);
        driverList.push(newDriver)
    }
    await driverUtils.updateDriversInDB(driverList);
    res.status(201).send("successfully added new drivers");
});

adminRouter.delete('/deleteDriver',async (req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    driverList.filter((driver)=>driver.phoneNumber == phoneNumber);
    await driverUtils.updateDriversInDB(driverList);
    res.status(200).send("successfully deleted new drivers");
});

module.exports = adminRouter;