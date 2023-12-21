const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailService = require("../services/mailer");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const resetPassword = require("../Templates/Mail/resetPassword");
const otp = require("../Templates/Mail/otp");


// Models
const User = require("../models/user");

// this function will return you jwt token
const signedToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET || "test");


/*
 *  @description     Register New User
 *  @route           POST /api/auth/register
 *  @access          Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "password"
  );

  // check if a verified user with given email exists
  const existing_user = await User.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    // user with this email already exists, Please login
    return res.status(400).json({
      status: "error",
      message: "Email already in use, Please login.",
    });

  }
  else if (existing_user) {
    // if not verified than update prev one
    await User.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

    // generate an otp and send to email
    req.userId = existing_user._id;
    next();

  }
  else {
    // if user is not created before than create a new one
    const new_user = await User.create(filteredBody);

    // generate an otp and send to email
    req.userId = new_user._id;
    next();

  }
});

/*
 *  @description     Send OTP mail to user
 *  @route           POST /api/auth/send-otp
 *  @access          Public
 */
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req;

  const new_otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const otp_expire_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent

  const user = await User.findByIdAndUpdate(userId, {
    otp_expiry_time: otp_expire_time,
  });

  user.otp = new_otp.toString();
  await user.save({ new: true, validateModifiedOnly: true });
  // console.log(new_otp);

  // send mail
  mailService.sendEmail({
    to: user.email,
    subject: "Verification OTP",
    html: otp(user.firstName, new_otp),
    attachments: [],
  });

  res.status(200).json({
    status: "success",
    message: "OTP Sent Successfully!",
  });

});

/*
 *  @description     Validate OTP 
 *  @route           POST /api/auth/verify
 *  @access          Public
 */
exports.verifyOTP = catchAsync(async (req, res, next) => {

  // verify otp and update user accordingly
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });
  const token1 = signedToken(user._id);
  console.log("fdfdfd", token1);
  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }

  // Incorrect OTP
  if (!(await user.correctOTP(otp, user.otp))) {
    return res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }

  // OTP is correct
  user.verified = true;
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });
  const token = signedToken(user._id);
  return res.status(200).json({
    status: "success",
    message: "OTP verified Successfully!",
    token,
    user_id: user._id,
  });

});

/*
 *  @description     Login a user to system
 *  @route           POST /api/auth/login
 *  @access          Public
 */
exports.login = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;
  // console.log(email, password);
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
  }

  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !user.password) {
    return res.status(400).json({
      status: "error",
      message: "Incorrect password",
    });
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });
  }

  const token = signedToken(user._id);
  return res.status(200).json({
    status: "success",
    message: "Logged in successfully!",
    token,
    user_id: user._id,
  });
});

/*
 *  @description     Send Forgot Password mail
 *  @route           POST /api/auth/forgot-password
 *  @access          Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "There is no user with email address.",
    });
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {

    const resetURL = `http://${process.env.FRONTEND_URL}/auth/new-password?token=${resetToken}`;

    mailService.sendEmail({
      to: user.email,
      subject: "Reset Password",
      html: resetPassword(user.firstName, resetURL),
      attachments: [],
    });

    return res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });

  } catch (err) {

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: "There was an error sending the email. Try again later!",
    });
  }
});

/*
 *  @description     Reset Password
 *  @route           POST /api/auth/reset-password
 *  @access          Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {

  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If no such user exist or token has expired
  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Token is Invalid or Expired",
    });
  }


  // Update changedPasswordAt property for the user
  // If token has not expired, and there is user, set the new password
  user.password = req.body.password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in, send JWT
  const token = signedToken(user._id);
  res.status(200).json({
    status: "success",
    message: "Password Reseted Successfully",
    token,
  });
});
