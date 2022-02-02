const User = require("../models/User");
const jwt = require("jsonwebtoken");

const serviceSID = "VAe59dd7b63ff9cf8cb4edbbb3e3861181";
const accountSID = "AC446a96938c974832f639def16975ba75";
const authToken = "d69abd11d90c7a95664a22d619f8311c";
const client = require("twilio")(accountSID, authToken);


//User Register API
const registerUser = async (req, res) => {
  console.log("wowww");
  console.log(req.body);

  const { name, email, phone, password, passwordVerify } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ errorMessage: "Enter minimum 6 characters" });
  }
  if (phone.length > 10 || phone.length < 10) {
    return res.status(400).json({ errorMessage: "Enter correct phone number" });
  }
  if (password !== passwordVerify) {
    return res.status(400).json({ errorMessage: "Enter the same password" });
  }
  console.log("ethiiiiiiiiii");

  User.findOne({ email }).exec((error, user) => {
    if (user)
      return res
        .status(400)
        .json({ errorMessage: "This Email is already taken" });
  });
  console.log("errorrr lllllaaaaaaa");
  const newUser = new User({ name, email, phone, password });
  console.log(newUser);
  await newUser.save((error, data) => {
    if (error) {
      return res.status(400).json({ errorMessage: "Something went wrong" });
    }
    if (data) {
      const token = jwt.sign({ user: data._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "2d",
      });
      console.log(token + "token ithannnnnn");
      return res.status(200).json({ token, data });
    }
  });
};

//User Login API
const loginUser = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).exec((error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      if (user.status) {
        if (user.authenticate(password)) {
          const token = jwt.sign(
            { user: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "2d" }
          );
          console.log(token + "login time token");
          console.log(user);
          res.status(200).json({ token, user });
        } else {
          return res
            .status(400)
            .json({ errorMessage: `Email and Password not match` });
        }
      } else {
        return res.status(400).json({ errorMessage: `Blocked by admin` });
      }
    } else {
      return res
        .status(400)
        .json({ errorMessage: `You don't have an account.Please signup` });
    }
  });
};


//OTP Send API
const otpSend = (req, res) => {
  const phone = req.body.number;
  console.log(phone);
  console.log("ithann phone number" + req.body.number);
  User.findOne({ phone }).exec((error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      console.log("otp verify step");
      client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${phone}`,
          channel: "sms",
        })
        .then((resp) => {
          console.log(resp + "otp povunnunddddd");
          return res.status(200).json({ resp });
        });
    } else {
      return res
        .status(400)
        .json({ errorMessage: `You don't have an account,Plz signup` });
    }
  });
};


// OTP Verify API
const otpVerify = (req, res) => {
  console.log(req.body);
  const { otp, number } = req.body;
  const phone = req.body.number;
  console.log(otp, phone);
  console.log("endhaaa pattiye");
  console.log(phone);

  User.findOne({ phone }).exec((error, user) => {
    console.log("usere thappi");
    if (error) return res.status(400).json({ error });
    console.log("thappi kayinj");
    if (user) {
      console.log("user ennit ind");
      client.verify
        .services(serviceSID)
        .verificationChecks.create({
          to: `+91${phone}`,
          code: otp,
        })
        .then((resp) => {
          console.log(resp + "ithannn otp responce........");
          if (resp.valid) {
            const token = jwt.sign(
              { user: user._id },
              process.env.JWT_SECRET_KEY
            );
            console.log(token + "login time token");
            console.log(user);
            return res.status(200).json({ token, user });
          }
        }).catch((error)=>{
          res.status(400).json({errorMessage:'Invalid OTP'})
        })
    } else {
      return res.status(400).json({ errorMessage: "Invalid OTP" });
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
