
const io = require('./index.js');

let userList = [];

io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // Handle chat event
    socket.on('bov-location', function(data){
        io.emit('bov-location', data);
    });

    // Handle typing event
    socket.on('user-location', function(data){
        io.emit('user-location', data);
    });

});