const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");


/*
 *  @description     Get or Search this users
 *  @route           GET /api/user/get-me
 *  @access          Protected
 */
exports.getMe = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: "success",
    data: {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      avatar: req.user.avatar,
      about: req.user.about,
    }
  });
});

/*
 * @description     Update details of this user
 * @route           PATCH /api/user/update-me
 * @access          Protected
 */
exports.updateMe = catchAsync(async (req, res) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const userDoc = await User.findByIdAndUpdate(
    req.user._id,
    filteredBody, {
    new: true,
    validateModifiedOnly: true
  }
  );
  return res.status(200).json({
    status: "success",
    data: {
      _id: userDoc._id,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      avatar: userDoc.avatar,
      about: req.user.about,
    },
    message: "User Updated successfully",
  });
});

/*
 * @description     Get or Search all users
 * @route           GET /api/user/get-users
 * @access          Public
 */
exports.getUsers = catchAsync(async (req, res) => {
  const all_users = await User.find({
    verified: true,
  }).select("firstName lastName _id email avatar about status");

  const this_user = req.user;

  const remaining_users = all_users.filter(
    (user) => user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
});

/*
 * @description     Get or Search all verified users
 * @route           GET /api/user/get-all-verified-users
 * @access          Public
 */
exports.getAllVerifiedUsers = catchAsync(async (req, res) => {
  const all_users = await User.find({
    verified: true,
  }).select("firstName lastName _id email avatar about status");

  const remaining_users = all_users.filter(
    (user) => user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
});

/*
 * @description     Get or Search all users starting with param search
 * @route           GET /api/user?search=
 * @access          Public
 */
exports.allUsers = catchAsync(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};
  console.log(req.query.search);
  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id }
  }).select("firstName lastName _id email avatar about status");

  res.send(users);
});
