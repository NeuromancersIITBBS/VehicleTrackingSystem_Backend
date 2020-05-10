const jwt = require('jsonwebtoken');
const fs = require('fs');
try{
    let privatKey = fs.readFileSync('./private.key', 'utf8'); 
} catch(err){
    console.err("Error while reading the RSA key. Generate 256 bits RSA key" +
    "and place in keys/private.key and keys/public.key.");
}
 


module.exports = {

};