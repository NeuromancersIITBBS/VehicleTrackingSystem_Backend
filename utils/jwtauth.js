const jwt = require('jsonwebtoken');
const fs = require('fs');

let privatKey = 1; 
let publicKey = 1;

try{
    privatKey = fs.readFileSync( './keys/private.key', 'utf8'); 
    publicKey = fs.readFileSync('./keys/public.key', 'utf8');
} catch(err){
    console.log(err);
    console.error('Error while reading the RSA keys. Generate 256 bits RSA keys' +
    'and place in keys/private.key and keys/public.key.');
}

// publicKey = privatKey = 'secret';

const signInfo = (payload, expiresIn) => {
    const options = {
        expiresIn: expiresIn,
        algorithm: 'RS256'
    };
    return jwt.sign(payload, privatKey, options);
}
 
const verifyInfo = (token) => {
    const options = {
        algorithm: ['RS256']
    };
    try{
        return jwt.verify(token, publicKey, options);
    } catch(err){
        return false;
    }
};

module.exports = {
    signInfo,
    verifyInfo
};