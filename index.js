const app = require('./app');
const config = require('./utils/config');
const socket = require('socket.io');
let PORT = 3000;

const server = app.listen(PORT, ()=>{
    console.log("I am listening on "+PORT);
});

const io = socket(server);

module.exports = io;


