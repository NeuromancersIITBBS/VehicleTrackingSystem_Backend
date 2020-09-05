const socket = require('socket.io');
let Driver = require('./Model/Driver');
const auth = require('./utils/jwtauth');
let activeDrivers = [];
let userList = [];
let tokenID = 0;

const queueWaitingTime = 20*60; // In Seconds
const tokenIDResetTime = 2*24*60*60; // In Seconds
const driverWaitingTime = 20*60 // In Seconds
let io;

module.exports.removeDriver = (phoneNumber) => {
    const driverID = activeDrivers.findIndex(driver => driver.phoneNumber === phoneNumber);
    if(driverID !== -1){
        activeDrivers.splice(driverID, 1);
        io.emit('removeDriver', {phoneNumber});
    }
}

module.exports.setupSocket = (server) => {
    io = socket(server, {cookie: false});
    
    // Automatically remove users from the queue after they have waited for more than queueWaitingTime Seconds
    // Change the interval time to an appropriate value
    // With the current interval, in worst case, user will stay in queue for 2*queueWaitingTime seconds
    setInterval(() => {
        let numOfUsers = 0;
        while(numOfUsers < userList.length && 
            Date.now() - userList[numOfUsers].timeStamp > queueWaitingTime*1000){
            // Send remove user broadcast for these users
            io.emit('removeUser', {id: userList[numOfUsers].id})
            numOfUsers++;
        }
        userList.splice(0, numOfUsers);
        console.log(`removed ${numOfUsers} users from the queue.`);
    }, queueWaitingTime*1000);
    
    // Reset the tokenID to 0 after tokenIDResetTime
    setInterval(() => {tokenID = 0;}, tokenIDResetTime*1000);

    // Remove inactive drivers periodically
    setInterval(() => {
        const inactiveDriversInd= [];
        const activeDriversInd= [];
        activeDrivers.forEach((driver, index) => {
            if(Date.now()-driver.timeStamp > driverWaitingTime*1000){
                inactiveDriversInd.push(index);
                io.emit('removeDriver', {phoneNumber: driver.phoneNumber});
            } else{
                activeDriversInd.push(index);
            }
        });
        activeDrivers = activeDriversInd.map(index => activeDrivers[index]);
        console.log(`Removed ${inactiveDriversInd.length} drivers from the list.`)
    }, driverWaitingTime*1000);

    /** ======================================= 
     * Responses to the User socket Calls
     ** ========================================*/
    io.on('connection', (socket) => {
        let userDriverList = {userList:userList, driverList:activeDrivers};
        console.log(`made socket connection: ${socket.id}`);
        
        // Provide base-data (requested while establishing new connetion or while reconnecting)
        socket.on('onConnection', () => {
            socket.emit('connectionResponse', userDriverList);
        });

        socket.on('book', (user) => {
            user.id = tokenID++;
            console.log(`BOOK: ${user.id}`);
            userList.push(user);
            // Generate token (conains userID and timeStamp) and add it to bookRespose
            const token = auth.signInfo({id: user.id, timeStamp: Date.now()}, queueWaitingTime);
            // Confirm Booking
            socket.emit('bookResponse', {...user, token});
            // Notify to all (don't emit token to all)
            socket.broadcast.emit('addUser', user);
        });

        socket.on('unbook', (userToken) => {
            // Validate Token
            const userInfo = auth.verifyInfo(userToken);
            const userID = userInfo.id;
            if(!userInfo || userID === null){
                // Invalid token
                socket.emit('userAuthFailed');
                return;
            }
            console.log(`UNBOOK: ${userID}`);
            const index = userList.findIndex(user => user.id == userID);
            // Remove user from the user array
            if(index !== -1){
                userList.splice(index, 1);
            } else{
                console.warn(`USER ID ${userID} is not present in users array!`);
            }
            // Confirm UnBook
            socket.emit('unbookResponse', {id: userID});
            // Notify to all
            socket.broadcast.emit('removeUser', {id: userID});
        });

        socket.on('gotIn', (userToken) => {
            // Validate Token
            const userInfo = auth.verifyInfo(userToken);
            const userID = userInfo.id;
            if(!userInfo || userID === null){
                // Invalid token
                socket.emit('userAuthFailed');
                return;
            }
            console.log(`GOT IN: ${userID}`);
            const index = userList.findIndex(user => user.id == userID);
            // Remove user from the user array
            if(index !== -1){
                userList.splice(index, 1);
            } else{
                console.warn(`USER ID ${userID} is not present in users array!`);
            }
            // Confirm GotIn
            socket.emit('gotInResponse', {id: userID});
            // Notify to all
            socket.broadcast.emit('removeUser', {id: userID});
        });

    /** ======================================= 
     * Responses to the Driver socket Calls
     ** ========================================*/

        socket.on('registerDriver', (driver) => {
            // Verify JWT token
            const driverInfo = auth.verifyInfo(driver.token);
            if(!driverInfo){
                // If unsuccessful send Auth failed
                socket.emit('driverAuthFailed', {message: 'Login Again!'});
                return;
            }
            if(activeDrivers.find(driverData => driverData.phoneNumber === driverInfo.phoneNumber)){
                // Driver already exists
                return;
            }
            // Add driver in activeDriversList
            const newDriver = new Driver(driverInfo.phoneNumber, driver.location, Date.now());
            activeDrivers.push(newDriver);
            console.log(`REGISTER DRIVER: ${newDriver.phoneNumber}`);
            // Send addDriver broadcast to all
            io.emit('addDriver', newDriver);
        });

        socket.on('updateDriverLocation', (driverData) => {
            // Verify JWT token
            const driverInfo = auth.verifyInfo(driverData.token);
            if(!driverInfo){
                // If unsuccessful send Auth failed
                socket.emit('driverAuthFailed', {message: 'Login Again!'});
                return;
            }
            // Find driver in activeDrivers list
            const driver = activeDrivers.find(tmpDriver => tmpDriver.phoneNumber === driverInfo.phoneNumber);
            if(!driver){
                // If unsuccessful send Auth failed
                socket.emit('driverAuthFailed', {message: 'Login Again!'});
                return;
            }
            // Update location
            driver.updateLocation(driverData);
            console.log(`UPDATE LOCATION: ${driver.phoneNumber}`);
            // send updateLocation broadcast to all
            io.emit('updateDriverLocation', {
                location: driver.location, 
                phoneNumber:driver.phoneNumber,
                timeStamp: driver.timeStamp
            });
            
        });
        
        socket.on('updateDriverData', (driverData) => {
            // Verify JWT token
            const driverInfo = auth.verifyInfo(driverData.token);
            if(!driverInfo){
                // If unsuccessful send Auth failed
                socket.emit('driverAuthFailed', {message: 'Login Again!'});
                return;
            }
            // Find driver in activeDrivers list
            const driver = activeDrivers.find(tmpDriver => tmpDriver.phoneNumber === driverInfo.phoneNumber);
            if(!driver){
                // If unsuccessful send Auth failed
                socket.emit('driverAuthFailed', {message: 'Login Again!'});
                return;
            }
            // Update data
            driver.updateData(driverData);
            // send updateLocation broadcast to all
            console.log(`UPDATE DATA: ${driver.phoneNumber}`);
            io.emit('updateDriverData', driver);
        });

        socket.on('driverLogOut', (driverData) => {
            io.emit('removeDriver', {phoneNumber: driverData.phoneNumber});
        });
    });
}