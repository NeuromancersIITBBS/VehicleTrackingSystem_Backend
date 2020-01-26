const driverCreationRouter = require('express').Router();

let driverList = [];
let requestDriverList = [];

class Driver{
    constructor(driverName, number, password){
        this.driverName = driverName;
        this.password = password;
        this.phoneNumber = number;
        this.isActive = false;
    }
}

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
    if(driverList.find(({ driver }) => driver.phoneNumber === phoneNumber )){
       res.status(406).send("Driver already exists. Kindly login. ")
    }
    let driver = new Driver(driverName,phoneNumber,password);
    res.status(201).send("Creation request is successful");
});

driverCreationRouter.post('/login',(req,res)=>{
    const driverName = req.body.name;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    let driver = driverList.find(({ driver }) => driver.phoneNumber === phoneNumber && driver.password===password );
    if(!driver){
        res.status(406).send("Driver doesn't exist.")
    }
    driver.isActive = true;

    res.status(201).send("login is successful");
});

driverCreationRouter.post('/logout',(req,res)=>{
    const phoneNumber = req.body.phoneNumber;
    let driver = driverList.find(({ driver }) => driver.phoneNumber === phoneNumber );
    if(!driver){
        res.status(406).send("Driver doesn't exist.")
    }
    driver.isActive = false;
    res.status(200).send("logout is successful");
});



module.exports.router = driverCreationRouter;
module.exports.driverList = driverList;
module.exports.requestDriverList = requestDriverList;
module.exports.Driver = Driver;