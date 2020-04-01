const socket = require('socket.io');
let driverList = require('./routers/driverCreationRouter').driverList;
let userList = [];

const updateTimeInterval = 60; // In Seconds
const queueWaitingTime = 20*60; // In Seconds

module.exports.setupSocket = (server) => {
    // Automatically remove people from the queue after they have waited for more than queueWaitingTime Seconds
    // Please change the interval time to an appropriate value
    // With the current interval, in worst case user will stay in queue for 2*queueWaitingTime seconds
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
    // TO DO: Implement a routine to remove old users from userList after T time interval
    // 2 Options: 1.) Update after every 1-2 min
    //            2.) Broadcast the changes instead of broadcasting all the data

    io.on('connection', (socket) => {
        let userDriverList = {"userList":userList, "driverList":driverList};
        console.log('made socket connection: ' + socket.id);

        socket.on('book', (user) => {
            console.log(`BOOK: ${user.id}`);
            userList.push(user);
            // user.ID == id of the user (socket.id of the user)
            // Confirm Booking
            io.emit('bookResponse', {id: user.id});
            //            2.) Update after every change  
            io.emit('updateMapData', userDriverList);
        });

        socket.on('unbook', (userID) => {
            console.log(`UNBOOK: ${userID}`);
            const index = userList.findIndex(user => user.ID == userID);
            userList.splice(index, 1);
            // Confirm UnBook
            io.emit('unbookResponse', {id: userID});
            // 2 Options: 1.) Update after every 1-2 min
            //            2.) Update after every change  
            io.emit('updateMapData', userDriverList);
        });

        socket.on('gotIn', (userID) => {
            // Works same as unbook
            // Can be used to determine the destination of the BOV
            console.log(`GOTIN: ${userID}`);
            const index = userList.findIndex(user => user.ID == userID);
            userList.splice(index, 1);
            // Confirm GotIn
            io.emit('gotInResponse', {id: userID});
            // 2 Options: 1.) Update after every 1-2 min
            //            2.) Update after every change  
            io.emit('updateMapData', userDriverList);
        });

        // Implementation of first Option
        // setInterval(() => {io.emit('updateMapData', userDriverList)}, updateTimeInterval*1000);
    });
}