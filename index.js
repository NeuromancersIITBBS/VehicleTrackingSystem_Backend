const app = require('./app');
const config = require('./utils/config');
const locationSharing = require('./LocationSharing');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log("I am listening on "+PORT);
});

locationSharing.setupSocket(server);