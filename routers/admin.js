const adminRouter = require('express').Router();
const requestDriverList = require('./driverCreationRouter').requestDriverList;
const db = require('../utils/database');


adminRouter.get('/allDrivers', async (req,res, next)=>{
    try{
        const driverList = await db.getAllDrivers();
        res.json(driverList.data);
    }catch(e){  
        next(e);
    }
});

adminRouter.get('/getRequestedDrivers',(req,res, next)=>{
    res.json(requestDriverList);
});

adminRouter.post('/DriverVerified',async (req,res, next)=>{
    try{
        let verifiedDriverList = req.body.verifiedDriverList;
        for (const driver of verifiedDriverList){
            let index = requestDriverList.findIndex((requestedDriver) => requestedDriver.phoneNumber == driver.phoneNumber);
            if(index != -1){
                // Add newDriver in the driverList and remove it from requestDriverList
                await db.addDriver(driver);
                requestDriverList.splice(index, 1);
                
            }else{
                console.warn('newDriver does not exist in requestedDriverList');
            }
        }
        res.status(201).json({message: "successfully added new drivers"});
    } catch(e){
        next(e);
    }
});

// Delete existing (i.e. verified) driver
adminRouter.delete('/deleteDriver',async (req,res, next)=>{
    try{
        let phoneNumber = req.body.phoneNumber;
        const driverRef = await db.getDriver(phoneNumber);
        const driverCheck = driverRef.data[0];
        if(!driverCheck){
            res.status(406).json({message: "Driver does not exist/Driver is not yet verified"});
            return;
        }
        await db.deleteDriver(phoneNumber);
        res.json({message: "successfully deleted new drivers"});
    }catch(e){
        next(e);
    }
});

// Delete unverified driver
adminRouter.delete('/rejectDriver',async (req,res, next)=>{
    try{
        let phoneNumber = req.body.phoneNumber;
        // Find the driver in the array
        let index = requestDriverList.findIndex((driver)=>driver.phoneNumber == phoneNumber);
        if(index == -1){
            res.status(406).json({message: "Driver does not exist/Driver is already verified"});
            return;
        } 
        // remove it
        requestDriverList.splice(index, 1);
        res.status(200).json({message: "successfully deleted new drivers"});
    }catch(e){
        next(e);
    }
});

module.exports = adminRouter;