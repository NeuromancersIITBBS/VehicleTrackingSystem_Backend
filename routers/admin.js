const adminRouter = require('express').Router();
let driverList = require('./driverCreationRouter').driverList;
let requestDriverList = require('./driverCreationRouter').requestDriverList;
let driverUtils = require('../utils/DriverCreationUtils');
let  Driver = require('./driverCreationRouter').Driver;


adminRouter.get('/allDrivers',(req,res)=>{
   res.status(200).send(driverList);
});

adminRouter.get('/getRequestedDrivers',(req,res)=>{
    res.send(requestDriverList);
});

adminRouter.post('/DriverVerified',async (req,res)=>{
    let verifiedDriverList = req.body.verifiedDriverList;
    for (const driver of verifiedDriverList){
        let index = requestDriverList.findIndex((requestedDriver) => requestedDriver.phoneNumber == driver.phoneNumber);
        if(index != -1){
            let newDriver = new Driver(driver.driverName, driver.phoneNumber,driver.password);
            // Add newDriver in the driverList and remove it from requestDriverList
            driverList.push(newDriver);
            requestDriverList.splice(index, 1);
        }else{
            console.warn('newDriver does not exist in requestedDriverList');
        }
    }
    await driverUtils.updateDriversInDB(driverList);
    res.status(201).send("successfully added new drivers");
});

// Delete existing (i.e. verified) driver
adminRouter.delete('/deleteDriver',async (req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    // Find the driver in the array
    let index = driverList.findIndex((driver)=>driver.phoneNumber == phoneNumber);
    if(index == -1){
        res.status(406).send("Driver does not exist/Driver is not yet verified");
        return;
    }
    // remove it
    driverList.splice(index, 1);
    await driverUtils.updateDriversInDB(driverList);
    res.status(200).send("successfully deleted new drivers");
});

// Delete unverified driver
adminRouter.delete('/rejectDriver',async (req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    // Find the driver in the array
    let index = requestDriverList.findIndex((driver)=>driver.phoneNumber == phoneNumber);
    if(index == -1){
        res.status(406).send("Driver does not exist/Driver is already verified");
        return;
    } 
    // remove it
    requestDriverList.splice(index, 1);
    res.status(200).send("successfully deleted new drivers");
});

module.exports = adminRouter;