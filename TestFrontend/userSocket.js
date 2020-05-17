let socket;
let userDriverList = {
    userList: [],
    driverList: []
};

$(() => {
    socket = io('http://localhost:3000');
    setUpSocket();
    socket.emit('onConnection');
    
    setupClickHandlers();
});


// Act on the socket messages sent by the server
function setUpSocket(){
    const userListDiv =$('#userList');
    const driverListDiv = $('#driverList');
    const bookDiv = $('#book');
    const unbookDiv = $('#unbook'); 
    const userIdDiv = $('#userID span');
    unbookDiv.hide();
    
    socket.on('connectionResponse', (res) => {
        userDriverList.userList = res.userList;
        userDriverList.driverList = res.driverList;

        userListDiv.text(JSON.stringify(userDriverList.userList));
        driverListDiv.text(JSON.stringify(userDriverList.driverList));
    });
    
    socket.on('bookResponse', (user) => {
        bookDiv.hide();
        unbookDiv.show();
        userIdDiv.text(user.id);
        userDriverList.userList.push(user);
        userListDiv.text(JSON.stringify(userDriverList.userList));
    });   

    socket.on('unbookResponse', (userID) => {
        bookDiv.show();
        unbookDiv.hide();
        userIdDiv.text('');
        const index = userDriverList.userList.findIndex(user => user.id === userID);
        userDriverList.userList.splice(index, 1);
        userListDiv.text(JSON.stringify(userDriverList.userList));
    });

    socket.on('addUser', (user) => {
        userDriverList.userList.push(user);
        userListDiv.text(JSON.stringify(userDriverList.userList));
    });
    
    socket.on('removeUser', ({userID}) => {
        const index = userDriverList.userList.findIndex(user => user.id === userID);
        userDriverList.userList.splice(index, 1);
        userListDiv.text(JSON.stringify(userDriverList.userList));
    });
    

    socket.on('addDriver', (driverData) => {        
        const driverIndex = userDriverList.driverList
        .findIndex(driver => driver.phoneNumber === driverData.phoneNumber);
        
        // Guard Clause (if driver already exists update its data)
        if(driverIndex !== -1){
            userDriverList.driverList[driverIndex] = driverData;
        } else{
            userDriverList.driverList.push(driverData);
        }
        driverListDiv.text(JSON.stringify(userDriverList.driverList));
    });
    
    socket.on('updateDriverData', (driverData) => {        
        const driverIndex = userDriverList.driverList
        .findIndex(driver => driver.phoneNumber === driverData.phoneNumber);
        // Guard Clause
        if(driverIndex === -1){
            console.error('DriverList out of sync!!!');
            return;
        }
        userDriverList.driverList[driverIndex]  = driverData;
        driverListDiv.text(JSON.stringify(userDriverList.driverList));
    });
    
    socket.on('updateDriverLocation', (driverData) => {
        const driverIndex = userDriverList.driverList
        .findIndex(driver => driver.phoneNumber === driverData.phoneNumber);
        if(driverIndex === -1){
            console.error('DriverList out of sync!!!');
        }
        else{
            userDriverList.driverList[driverIndex].location  = driverData.location;
            userDriverList.driverList[driverIndex].timeStamp  = driverData.timeStamp;
        }
        driverListDiv.text(JSON.stringify(userDriverList.driverList));
    });

    socket.on('removeDriver', (driverData) => {
        const driverIndex = userDriverList.driverList
        .findIndex(driver => driver.phoneNumber === driverData.phoneNumber);
        if(driverIndex === -1){
            return;
        }
        userDriverList.driverList.splice(driverIndex, 1);
        driverListDiv.text(JSON.stringify(userDriverList.driverList));
    });
}

function setupClickHandlers(){
    const bookBtn = $('#bookBtn');
    const unbookBtn = $('#unbookBtn');
    const gotInBtn = $('#gotInBtn');

    bookBtn.click(() => {
        const pickupObj = {
            pickupPoint: 'LBC', 
            location: {
                lat: 20.147798,
                lng: 85.678577
            }
        };
        const userData = {
            id: null,
            location: pickupObj,
            destination: 'MHR',
            timeStamp: Date.now()
        };
        socket.emit('book', userData);
    });

    unbookBtn.click(() => {
        const userID = $('#userID span').text();
        console.log(userID);
        socket.emit('unbook', userID);
    });

    gotInBtn.click(() => {
        const userID = $('#userID span').text();
        console.log(userID);
        socket.emit('unbook', userID);
    });
}