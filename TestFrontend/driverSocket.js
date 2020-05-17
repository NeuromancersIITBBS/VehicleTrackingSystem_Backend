let socket;
const userDriverList = {
    userList: [],
    driverList: []
};
let globDriver = null;
let token = null;

$(() => {
    socket = io('http://localhost:3000');
    socket.emit('onConnection');

    setUpSocket();
    setupAuthHandlers();
    setupDataIUpdates();
});


// Act on the socket messages sent by the server
function setUpSocket(){
    const userListDiv =$('#userList');
    const driverListDiv = $('#driverList');

    socket.on('connectionResponse', (res) => {
        userDriverList.userList = res.userList;
        userDriverList.driverList = res.driverList;

        userListDiv.text(JSON.stringify(userDriverList.userList));
        driverListDiv.text(JSON.stringify(userDriverList.driverList));
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
            console.log(driverData)
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

    socket.on('driverAuthFailed', (data) => {
        alert(data.message || 'Please login again!');
    });
}

function setupDataIUpdates(){
    const locationBtn = $('#locationBtn');
    const dataBtn = $('#dataBtn');
    locationBtn.click((e) => {
        e.preventDefault();
        const lat = $('#lat').val();
        const lng = $('#lng').val();
        const location = { lat, lng };
        const timeStamp = Date.now();
        socket.emit('updateDriverLocation', { location, token, timeStamp });
    });
    dataBtn.click((e) => {
        e.preventDefault();
        const occupiedSeats = $('#occupiedSeats').val();
        const status = $('#status').val();
        const destination = $('#destination').val();
        const timeStamp = Date.now();
        const data = { token, occupiedSeats, status, destination, timeStamp };
        socket.emit('updateDriverData', data);
    });
}

function setupAuthHandlers(){
    // Login
    const logInDiv = $('#driverLogIn');
    const logOutDiv = $('#driverLogOut');
    const logInBtn = $('#logInBtn');
    const logOutBtn = $('#logOutBtn');
    
    logOutDiv.hide();
    logInBtn.click((e) => {
        e.preventDefault();
        const phoneNumber = $('#phoneNumber').val();
        const password = $('#password').val();
        const driver = {
            phoneNumber,
            password
        };
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/vts/new_driver/login',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(driver),
            success: function(data, status, xhr){
                globDriver = driver;
                const driverToken = $('#driverToken span');
                driverToken.text(driver.phoneNumber);
                token = data.token;
                // After successful login register driver on socket
                navigator.geolocation.getCurrentPosition((position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude, 
                    }
                    socket.emit('registerDriver', {token, location});
                });
                
                logOutDiv.show();
                logInDiv.hide();
            },
            error: function(xhr, status, data){
                alert('Error while logging in')
            },
        });
    });
    logOutBtn.click((e) => {
        e.preventDefault();
        const phoneNumber = globDriver.phoneNumber;
        const driver = { phoneNumber: phoneNumber };
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/vts/new_driver/logout',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(driver),
            success: function(data, status, xhr){
                globDriver = null;
                const driverToken = $('#driverToken span');
                driverToken.text('');
                token = null;
                logInDiv.show();
                logOutDiv.hide();
            },
            error: function(xhr, status, data){
                alert('Error while logging out')
            },
        });
    });
}