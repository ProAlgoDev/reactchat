const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  about: {
    type: String,
    default: "Hey There! Let's catch up sometime.",
  },
  avatar: {
    type: String,
    default: "https://firebasestorage.googleapis.com/v0/b/babble-ba1e3.appspot.com/o/profilePic%2Fdefault.jpg",
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email must be unique"],
    validate: {
      validator: function (email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      message: (props) => `Email (${props.value}) is invalid!`,
    },
  },
  password: {
    // unselect
    type: String,
  },
  passwordChangedAt: {
    // unselect
    type: Date,
  },
  passwordResetToken: {
    // unselect
    type: String,
  },
  passwordResetExpires: {
    // unselect
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otp_expiry_time: {
    type: Date,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  status: {
    type: String,
    enum: ["Online", "Offline"],
    default: "Offline"
  },
  lastOnline: {
    type: Date
  }
});

userSchema.pre("save", async function (next) {

  // Only run this function if password was actually modified
  if (!this.isModified("otp") || !this.otp) return next();

  // Hash the otp with cost of 12
  this.otp = await bcrypt.hash(this.otp.toString(), 12);

  next();
});

userSchema.pre("save", async function (next) {

  // Only run this function if password was actually modified
  if (!this.isModified("password") || !this.password) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {

  if (!this.isModified("password") || this.isNew || !this.password)
    return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.correctPassword = async function (
  testPassword,
  userPassword
) {
  return await bcrypt.compare(testPassword, userPassword);
};

userSchema.methods.correctOTP = async function (testOTP, userOTP) {
  return await bcrypt.compare(testOTP, userOTP);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {

  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  // FALSE MEANS NOT CHANGED
  return false;
};

userSchema.methods.createPasswordResetToken = function () {

  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = new mongoose.model("User", userSchema);
module.exports = User;
