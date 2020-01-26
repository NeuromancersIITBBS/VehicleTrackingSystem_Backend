const express = require('express');
const app = express();
const cors = require('cors');
const driverCreationRouter = require('/routers/driverCreationRouter').router;

const adminRouter = require('/routers/admin');

app.use(express.json());
app.use(cors());

app.use('/vts/new_driver', driverCreationRouter);
app.use('vts/admin',adminRouter);

module.exports= app;
