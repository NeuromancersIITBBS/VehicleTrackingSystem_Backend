const io = require('./index.js');
let driverList = require('routers/driverCreationRouter').driverList;
let userList = [];


io.on('connection', (socket) => {
    let userDriverList = {"userList":userList,"driverList":driverList};
    console.log('made socket connection', socket.id);

    socket.on('user-connection', (user)=>{
        userId = user.id;
        if(!userList.find((currUser)=>currUser.id==userId)) {
            userList.push(user);
        }

        io.emit('user-connection', userDriverList);
    });

    socket.on('driver-connection', ()=>{
        //to be added
        io.emit('driver-connection', userDriverList);
    });

    socket.on('bov-location', function(data){
        io.emit('bov-location', data);
    });


});