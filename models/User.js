const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,

      trim: true,
      lowercase: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true, 
    },
    status: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
UserSchema.virtual("password").set(function (password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
});

UserSchema.methods = {
  authenticate: function (password) {
    return bcrypt.compareSync(password, this.passwordHash);
  },
};

module.exports = mongoose.model("User", UserSchema);
