const auth = require('./jwtauth');

const verifyDriver = (req, res, next) => {
    if(!req.headers.authorization){
        return res.sendStatus(401);
    }
    const token = req.headers.authorization.split(" ")[1];
    const driver = auth.verifyInfo(token);
    if(!driver){
        return res.sendStatus(401);
    }
    // Attach driver's info
    res.locals.driver = driver;
    next();
};

const requestLogger = (req, res, next) => {
    console.log("--------------------------------------------------");
    console.log("Request Method: "+ req.method);
    console.log("Request Path: "+ req.path);
    console.log("Request Body: "+ JSON.stringify(req.body));
    console.log("--------------------------------------------------");
    next();
};

const unknownEndpoint = (req, res) => {
  return res.status(404).send({error: 'unknown end point'});
};

const errorHandler = (err, req, res, next) => {
    console.log(err);
    console.log(err.stack);
    next();
};

module.exports = {
    verifyDriver,
    requestLogger,
    unknownEndpoint,
    errorHandler
};
