import jwt from 'jsonwebtoken';

console.log('program initiated');
const user = {email:"russell_driver@ymail.com"}
const secret = "09080706";
const token = jwt.sign(user,secret,{expiresIn:"0s"});

jwt.verify(token,secret, (err, decoded) => {
    if(err) {
        console.log(typeof err);
    } else {
        console.log(decoded);
    }
})



