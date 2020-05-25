const driverCreationRouter = require('express').Router();
const verifyDriver = require('../utils/middleware').verifyDriver;
const auth = require('../utils/jwtauth');
const db = require('../utils/database');
const bcrypt = require('bcrypt');

const requestDriverList = [];

// Test routine
driverCreationRouter.get('/hello', (req,res, next)=>{
    res.json({message: "Welcome to driver creation"});
});

driverCreationRouter.post('/forgotPassword', async (req,res, next)=>{
    try{
        const driverRef = await db.getDriver(req.body.phoneNumber);
        const driverCheck = driverRef.data[0];
        if(!driverCheck){
            res.status(406).json({message: "Driver doesn't exist. Kindly register."})
        }else{
            res.status(200).json({message: "Kindly contact Secretary of programming society."});
        } 
    } catch(e){
        next(e);
    }
});

driverCreationRouter.post('/register',async (req,res, next)=>{
    try{
        const driverName = req.body.driverName;
        const phoneNumber = req.body.phoneNumber;
        const plainPassword = req.body.password;
    
        const driverRef = await db.getDriver(req.body.phoneNumber);
        const driverCheck = driverRef.data[0];
        if(driverCheck){
            res.status(406).json({message: "Driver already exists. Kindly login. "});
            return;
        }
        else if(requestDriverList.find((driver) => driver.phoneNumber === phoneNumber )){
            res.status(406).json({message: "Driver already registerd once. Kindly wait for the verification."});
            return;
        }
        // Hash the plainPassword using bcrypt
        const password = await bcrypt.hash(plainPassword, 10);
        let driver = {driverName, phoneNumber, password};
        requestDriverList.push(driver);
        res.status(201).json({message: "Creation request is successful"});
    } catch(e){
        next(e);
    }
});

driverCreationRouter.post('/login', async (req,res, next)=>{
    try{
        const phoneNumber = req.body.phoneNumber;
        const password = req.body.password;
        const driverRef = await db.getDriver(phoneNumber);
        const driverCheck = driverRef.data[0];
        if(!driverCheck){
            res.status(406).json({message: "Login failed!"});
            return;
        }
        const match = await bcrypt.compare(password, driverCheck.password);
        if(!match){
            res.status(406).json({message: "Login failed!"});
            return;
        }
        await db.setActiveStatus(phoneNumber, true);
        const driverInfo = {
            phoneNumber: phoneNumber,
            timeStamp: Date.now()
        }
        res.status(201).json({token: auth.signInfo(driverInfo, '3h')});
    }catch(e){
        next(e);
    }
});

// Test Route (To be removed)
driverCreationRouter.get('/verify', verifyDriver, async (req, res) => {
    res.status(200).json(res.locals.driver);
});

driverCreationRouter.post('/logout', async (req,res, next)=>{
    try{
        const phoneNumber = req.body.phoneNumber;
        const driverRef = await db.getDriver(phoneNumber);
        const driverCheck = driverRef.data[0];
        if(!driverCheck || !driverCheck.isActive){
            res.status(406).json({message: "Driver doesn't exist."});
            return;
        }
        await db.setActiveStatus(phoneNumber, false);
        res.status(200).json({message: "logout is successful"});
    }catch(e){
        next(e);
    }
});

module.exports.router = driverCreationRouter;
module.exports.requestDriverList = requestDriverList;