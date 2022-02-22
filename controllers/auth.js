const User = require("../models/User");
const jwt = require("jsonwebtoken");

const serviceSID = "VAe59dd7b63ff9cf8cb4edbbb3e3861181";
const accountSID = "AC446a96938c974832f639def16975ba75";
const authToken = "d69abd11d90c7a95664a22d619f8311c";
const client = require("twilio")(accountSID, authToken);

//User Register API
const registerUser = async (req, res) => {


  const { name, email, phone, password, passwordVerify } = req.body;
  if (password.length < 6) {
     res.status(400).json({ errorMessage: "Enter minimum 6 characters" });
  }
 
  else if (password !== passwordVerify) {
     res.status(400).json({ errorMessage: "Enter the same password" });
  }
  else{
    User.findOne({ email }).exec((error, user) => {
      if (user)
        return res
          .status(400)
          .json({ errorMessage: "This Email is already taken" });
    });
   
    const newUser = new User({ name, email, phone, password });
    console.log(newUser);
    await newUser.save((error, user) => {
      if (error) {
        res.status(400).json({ errorMessage: "Something went wrong" });
      }
      else {
        const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY, {
          expiresIn: "2d",
        });
      
       res.status(200).json({ token, user });
      }
    });
    
  }
 

  
};

//User Login API
const loginUser = async (req, res) => {
  const { email, password } = req.body;
 
 const user = await User.findOne({ email })
  try {
    
    if (user) {
    
      if (user.status) {
   
        if (user.authenticate(password)) {
          const token = jwt.sign(
            { user: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "2d" }
          );
          
        
          res.status(200).json({ token, user });
        } else {
       
          res
            .status(400)
            .json({ errorMessage: `Email and Password not match` });
        }
      } else {
    
        res.status(400).json({ errorMessage: `Blocked by admin` });
      }
    } else {
      res
        .status(401)
        .json({ errorMessage: `You don't have an account.Please signup` });
    }
  } 
      catch (error) {
     
    res.status(400).json({error})
      }  
    
};

//OTP Send API
const otpSend = (req, res) => {
  const phone = req.body.number;

 
  User.findOne({ phone }).exec((error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {

      client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+${phone}`,
          channel: "sms",
        })
        .then((resp) => {
        
         res.status(200).json({ resp });
        });
    } else {
       res
        .status(401)
        .json({ errorMessage: `You don't have an account,Plz signup` });
    }
  });
};

// OTP Verify API
const otpVerify = (req, res) => {

  const { otp } = req.body;
  const phone = req.body.number;
  

  User.findOne({ phone }).exec((error, user) => {
   console.log(phone);
   console.log(otp);
    if (error) return res.status(400).json({ error });
    console.log("thappi kayinj");
    if (user) {
      console.log("user ennit ind");
      client.verify
        .services(serviceSID)
        .verificationChecks.create({
          to: `+${phone}`,
          code: otp,
        })
        .then((resp) => {
          console.log(resp);
          console.log('response ind');
          console.log(resp.valid);
          if (resp.valid) {
            const token = jwt.sign(
              { user: user._id },
              process.env.JWT_SECRET_KEY
            );
            console.log(token + "login time token");
            console.log(user);
            let user=user.name;
           res.status(200).json({ token, user });
          }
        })
        .catch((error) => {
          res.status(400).json({ errorMessage: "Invalid OTP" });
        });
    }
  });
};

//Admin Login API

const adminLogin = (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ errorMessage: "All fields are required" });
    }
    if (email === "admin@new" && password === "123456") {
      const admin = true;
      const adminToken = jwt.sign({ admin: true }, process.env.JWT_SECRET_KEY);
      console.log(adminToken);

      return res.status(200).json({ adminToken, admin });
    } else {
      return res.status(401).json({ errorMessage: "Wrong email or password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

module.exports = { registerUser, loginUser, otpSend, otpVerify, adminLogin };
