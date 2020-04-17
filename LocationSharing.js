const socket = require('socket.io');
let driverList = require('./routers/driverCreationRouter').driverList;
let driverListSocketV = require('./routers/driverCreationRouter').driverListSocketV;
let userList = [];
let tokenID = 0;

const queueWaitingTime = 20*60; // In Seconds
const tokenIDResetTime = 2*24*60*60; // In Seconds

module.exports.setupSocket = (server) => {
    const io = socket(server);
    
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

    /** ======================================= 
     * Responses to the User socket Calls
     ** ========================================*/
    io.on('connection', (socket) => {
        let userDriverList = {'userList':userList, 'driverList':driverListSocketV};
        console.log(`made socket connection: ${socket.id}`);
        
        // Provide base-data (requested while establishing new connetion or while reconnecting)
        socket.on('onConnection', () => {
            socket.emit('connectionResponse', userDriverList);
        });

        socket.on('book', (user) => {
            user.id = tokenID++;
            console.log(`BOOK: ${user.id}`);
            userList.push(user);
            // Confirm Booking
            socket.emit('bookResponse', {id: user.id});
            // Notify to all 
            socket.broadcast.emit('addUser', user);
        });

        socket.on('unbook', (userID) => {
            console.log(`UNBOOK: ${userID}`);
            const index = userList.findIndex(user => user.id == userID);
            userList.splice(index, 1);
            // Confirm UnBook
            socket.emit('unbookResponse', {id: userID});
            // Notify to all
            socket.broadcast.emit('removeUser', {id: userID});
        });

        socket.on('gotIn', (userID) => {
            // Works same as unbook
            // Can be used to determine the destination of the BOV
            console.log(`GOTIN: ${userID}`);
            const index = userList.findIndex(user => user.id == userID);
            userList.splice(index, 1);
            // Confirm GotIn
            socket.emit('gotInResponse', {id: userID});
            // Notify to all
            socket.broadcast.emit('removeUser', {id: userID});
        });

    /** ======================================= 
     * Responses to the Driver socket Calls
     ** ========================================*/
        socket.on('updateDriverLocation', (driver) => {
            // Fetch the drive by phoneNumber
            const driverRef = driverList.find((tmpDriver) => tmpDriver.phoneNumber === driver.phoneNumber);
            // Guard-Clause
            if(!driverRef){
                socket.emit('DriverAuthFailed', {message: 'Driver does not exist'});
                return;
            }
            // Verify the driver data
            const keyVal = driverRef.phoneNumber+driverRef.password.substr(0, driverRef.password.length-2);
            if(driver.key !== keyVal){
                socket.emit('DriverAuthFailed', {message: 'Wrong key used'});
                return;
            }
            // Update in the driverListSocketV array
            let driverRefSocket = driverListSocketV.find((tmpDriver) => tmpDriver.phoneNumber === driver.phoneNumber);
            driverRefSocket.location.location = driver.location.location;
            // Emit to all and give confirmation to the driver
            socket.emit('updateDriverLocationResponse');
            const updatedData = {
                phoneNumber: driver.phoneNumber,
                location: driver.location
            };
            socket.broadcast.emit('updateDriverLocation', updatedData);
        });

        socket.on('updateDriverData', (driver) => {
            // Fetch the drive by phoneNumber
            const driverRef = driverList.find((tmpDriver) => tmpDriver.phoneNumber === driver.phoneNumber);
            // Guard-Clause
            if(!driverRef){
                socket.emit('DriverAuthFailed', {message: 'Driver does not exist'});
                return;
            }
            // Verify the driver data
            const keyVal = driverRef.phoneNumber+driverRef.password.substr(0, driverRef.password.length-2);
            if(driver.key !== keyVal){
                socket.emit('DriverAuthFailed', {message: 'Wrong key used'});
                return;
            }
            // Update in the driverListSocketV array
            let driverRefSocket = driverListSocketV.find((tmpDriver) => tmpDriver.phoneNumber === driver.phoneNumber);
            driverRefSocket.location.location = driver.location.location;
            driverRefSocket.occupiedSeats = driver.occupiedSeats;
            // Emit to all and give confirmation to the driver
            socket.emit('updateDriverLocationResponse');
            const updatedData = {
                phoneNumber: driver.phoneNumber,
                location: driver.location,
                occupiedSeats: driver.occupiedSeats
            };
            socket.broadcast.emit('updateDriverData', updatedData);
        });
        socket.on('updateDriverData', (driver) => {
            console.log(driver);
        });
    });
}


/**  ===================================
 * Changes required in frontend: 
 * 1.) change driver.id to driver.phoneNumber
 * 2.) change driver.status to driver.isActive
 * 3.) Add "key" attribute in the driver object
 *     driver.key = driver.phoneNum+driver.password(remove the last 2 chars of the password for safety :) )
 * 4.) Clarify whether the driver.location.location is the location of the pickuppoint
 *     or is it the current location of the driver
 * 5.) Properly link files and change path problems
 * =========================================*/