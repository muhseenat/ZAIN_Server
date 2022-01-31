const jwt = require("jsonwebtoken");






const verifyTokenAndAdmin = (req, res, next) => {
   if(req.headers.token){
    const admin = jwt.verify(token, process.env.JWT_SECRET_KEY);
     next();
   }

    verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not alowed to do that!");
      }
    });
  };





  const jwt = require("jsonwebtoken");

///middleware to check login or not
exports.requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split("")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = user;
  } else {
    return res.status(400).json({ errorMessage: "Authorization required" });
  }

  next();
};



const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not alowed to do that!");
      }
    });
  };
  