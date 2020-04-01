const socket = require('socket.io');
let driverList = require('./routers/driverCreationRouter').driverList;
let userList = [];

const queueWaitingTime = 20*60; // In Seconds

module.exports.setupSocket = (server) => {
    // Automatically remove users from the queue after they have waited for more than queueWaitingTime Seconds
    // Change the interval time to an appropriate value
    // With the current interval, in worst case, user will stay in queue for 2*queueWaitingTime seconds
    setInterval(() => {
        let numOfUsers = 0;
        while(numOfUsers < userList.length && 
            Date.now() - userList[numOfUsers].timeStamp > queueWaitingTime*1000){
            numOfUsers++;
        }
        userList.splice(0, numOfUsers);
        console.log(`removed ${numOfUsers} users from the queue.`);
    }, queueWaitingTime*1000);

    const io = socket(server);

    /** ======================================= 
     * Responses to the User socket Calls
     ** ========================================*/
    io.on('connection', (socket) => {
        let userDriverList = {'userList':userList, 'driverList':driverList};
        console.log(`made socket connection: ${socket.id}`);
        
        // Provide base-data (requested while establishing new connetion or while reconnecting)
        socket.on('baseDataRequest', () => {
            socket.emit('baseData', userDriverList);
        });

        socket.on('book', (user) => {
            console.log(`BOOK: ${user.id}`);
            userList.push(user);
            // Confirm Booking
            io.emit('bookResponse', {id: user.id});
            // Notify to all 
            io.emit('addUser', {user: user});
        });

        socket.on('unbook', (userID) => {
            console.log(`UNBOOK: ${userID}`);
            const index = userList.findIndex(user => user.ID == userID);
            userList.splice(index, 1);
            // Confirm UnBook
            io.emit('unbookResponse', {id: userID});
            // Notify to all
            io.emit('removeUser', {id: userID});
        });

        socket.on('gotIn', (userID) => {
            // Works same as unbook
            // Can be used to determine the destination of the BOV
            console.log(`GOTIN: ${userID}`);
            const index = userList.findIndex(user => user.ID == userID);
            userList.splice(index, 1);
            // Confirm GotIn
            io.emit('gotInResponse', {id: userID});
            // Notify to all
            io.emit('removeUser', {id: userID});
        });

    /** ======================================= 
     * Responses to the Driver socket Calls (Incomplete)
     ** ========================================*/
        socket.on('updateLocation', (driver) => {
            console.log(`LOCATION_UPDATE: ${driver.id}`);
        });

    });
}