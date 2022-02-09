const jwt = require('jsonwebtoken');


const verifyToken =(req,res,next)=>{
    const token= req.headers.token
    if(token){
        
        jwt.verify(token, process.env.JWT_SECRET_KEY,(err,user)=>{
            if(err) res.status(403).json("Invalid token")
        })
    }
}


//check the token is from addmin or user