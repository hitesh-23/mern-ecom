const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErros = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

//Register a user
exports.registerUser = catchAsyncErros(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      url: "profilepicUrl",
    },
  });

  sendToken(user, 201, res);
});

//Login a user

exports.loginUser = catchAsyncErros(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password"), 401);
  }

  const isPasswordMatched = user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password"), 401);
  }

  sendToken(user, 200, res);
});

//logout a user

exports.logoutUser = catchAsyncErros(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

//forgot password

exports.forgotPassword = catchAsyncErros(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorHandler(`No user found with email ${req.body.email}`, 404)
    );
  }

  //Get reset password token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then please ignore`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//reset password token
exports.resetPassword = catchAsyncErros(async (req, res, next) => {
  //creating token hash

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler(`Token expiration time is invalid`, 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler(`password does not match`, 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

//Get user details

exports.getUserDetails = catchAsyncErros(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return;
  }

  res.status(200).json({ success: true, user });
});

exports.changePassword = catchAsyncErros(async (req, res, next) => {
  console.log("hey");
  const { password, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (confirmPassword !== newPassword) {
    return next(new ErrorHandler("password do not match"), 400);
  }

  const isPasswordMatch = user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid password"), 400);
  }

  user.password = newPassword;
  await user.save();

  sendToken(user, 200, res);
});

exports.updateProfile = catchAsyncErros(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Get all users (admin)
exports.getAllUsers = catchAsyncErros(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.getSingleUser = catchAsyncErros(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//delete user

exports.deleteUser = catchAsyncErros(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  // we will remove cloudinary later

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist for id ${req.params.id}`),
      404
    );
  }

  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

exports.updateUserRole = catchAsyncErros(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});
