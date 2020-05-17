const driverCreationRouter = require('express').Router();
const verifyDriver = require('../utils/middleware').verifyDriver;
const auth = require('../utils/jwtauth');
let driverUtils = require('../utils/DriverCreationUtils');

let driverList = [];
let requestDriverList = [];

// Fetch the existing list of the drivers
driverUtils.readDriversFromDB().then((data) => {
    if(!data) return;
    // note:  refernce of the driverList must not change
    let driversDB = JSON.parse(data);
    driversDB.forEach((driver) => {
        driverList.push(driver);
    });
}).catch((err) => {
    console.log('Retrival of drivers from db failed!');
    console.log(err);
});

class Driver{
    constructor(driverName, number, password){
        this.driverName = driverName;
        this.password = password;
        this.phoneNumber = number;
        this.isActive = false;
    }
}

// The object which would be used in broadcast


// This method is used for making a deep copy of the driver 
// It removes the password from the user object
// Making it safe for sending to all the users
// let transformToDriverSocketV = (driver) => {
//     let driverSocket = new DriverSocketV(driver.driverName, driver.phoneNumber);
//     return driverSocket;
// };

// Test routine
driverCreationRouter.get('/hello', (req,res)=>{
    res.send("Welcome to driver creation");
});

driverCreationRouter.post('/forgotPassword', (req,res)=>{
    const phoneNumber = req.body.phoneNumber;
    if(!driverList.find((driver) => driver.phoneNumber == phoneNumber )){
        res.status(406).send("Driver doesn't exist. Kindly register.")
    }else{
        res.status(200).send("Kindly contact Secretary of programming society.");
        // use nexmo to send a message
    }
});

driverCreationRouter.post('/register',async (req,res)=>{
    const driverName = req.body.name;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    if(driverList.find((driver) => driver.phoneNumber === phoneNumber )){
        res.status(406).send("Driver already exists. Kindly login. ");
        return;
    }
    else if(requestDriverList.find((driver) => driver.phoneNumber === phoneNumber )){
        res.status(406).send("Driver already registerd once. Kindly wait for the verification. ");
        return;
    }
    let driver = new Driver(driverName,phoneNumber,password);
    requestDriverList.push(driver);
    res.status(201).send("Creation request is successful");
});

driverCreationRouter.post('/login',(req,res)=>{
    const driverName = req.body.name;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    let driver = driverList.find((driver) => driver.phoneNumber === phoneNumber && driver.password===password );
    if(!driver){
        res.status(406).send("Driver doesn't exist.");
        return;
    }
    const driverInfo = {
        phoneNumber: phoneNumber,
        timeStamp: Date.now()
    }
    res.status(201).json({token: auth.signInfo(driverInfo, '10m')});
});

// Test Route (To be removed)
driverCreationRouter.get('/verify', verifyDriver, (req, res) => {
    res.status(200).json(res.locals.driver);
});

driverCreationRouter.post('/logout',(req,res)=>{
    const phoneNumber = req.body.phoneNumber;
    let driver = driverList.find((driver) => driver.phoneNumber === phoneNumber );
    if(!driver){
        res.status(406).send("Driver doesn't exist.");
        return;
    }
    driver.isActive = false;
    res.status(200).send("logout is successful");
});

module.exports.router = driverCreationRouter;
module.exports.driverList = driverList;
module.exports.requestDriverList = requestDriverList;
module.exports.Driver = Driver;