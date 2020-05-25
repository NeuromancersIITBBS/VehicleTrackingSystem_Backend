const express = require('express');
const app = express();
const cors = require('cors');
const driverCreationRouter = require('./routers/driverCreationRouter').router;
const adminRouter = require('./routers/admin');
const middleware = require('./utils/middleware');

app.use(express.json());
app.use(cors());
app.use(middleware.requestLogger);

app.use('/vts/new_driver', driverCreationRouter);
app.use('/vts/admin',adminRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports= app;
