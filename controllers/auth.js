const User = require("../models/User");
const jwt = require("jsonwebtoken");

const serviceSID = "VAe59dd7b63ff9cf8cb4edbbb3e3861181";
const accountSID = "AC446a96938c974832f639def16975ba75";
const authToken = "d69abd11d90c7a95664a22d619f8311c";
const client = require("twilio")(accountSID, authToken);

const registerUser = (req, res) => {
  console.log("wowww");

  const { name, email, phone, password, passwordVerify } = req.body;

  User.findOne({ email }).exec((error, user) => {
    if (user)
      return res
        .status(400)
        .json({ errorMessage: "This Email is already taken" });
  });

  newUser.save((error, data) => {
    if (error) {
      return res.status(400).json({ errorMessage: "Something went wrong" });
    }
    if (data) {
      const token = jwt.sign(
        { user: data._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );
      console.log(token + "token ithannnnnn");
      return res.status(201).json({ token, data });
    }
  });
};

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

const otpVerify = (req, res) => {
  console.log(req.body + "ithannn request");
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
        });
    } else {
      return res.status(400).json({ errorMessage: "Invalid OTP" });
    }
  });
};

module.exports = { registerUser, loginUser, otpSend, otpVerify }
