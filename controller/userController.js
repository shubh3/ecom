const User = require("../models/User");
const bigPromise = require("../middleware/bigPromise.js");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/CustomError");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = bigPromise(async (req, res, next) => {
  let result;

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(
      new CustomError("Email, Name and password are required field", 400)
    );
  }

  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  //check for presence of email and password
  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  //does user exist
  if (!user) {
    return next(new CustomError("You are not registered", 400));
  }
  //Validating password
  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect) {
    return next(new CustomError("Email or password is incorrect", 400));
  }

  cookieToken(user, res);
});

exports.logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    sucess: true,
    message: "Logged out",
  });
});

exports.forgotpassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  //console.log(user);

  if (!user) {
    return next(new CustomError("email not found", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in the browser and hit enter ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "LCO TSTORE - Password reset email",
      message,
    });

    res.status(200).json({
      sucess: true,
      mesaage: "Email sent successfully",
    });
  } catch (error) {
    user.getForgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomError(error.message), 500);
  }
});

exports.passwordreset = bigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired"), 400);
  }

  if (req.body.password !== req.body.confirmpassword) {
    return next(new CustomError("Password don't match"), 400);
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  cookieToken(user, res);
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = bigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isOldPassword = await user.isValidatedPassword(req.body.oldpassword);

  if (!isOldPassword) {
    return next(CustomError("Old password is incorrect", 400));
  }

  user.password = req.body.password;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = User.findById(req.user.id);

    const imageId = user.photo.id;
    //delete photo
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    //upload the new photo
    const result = await cloudinary.v2.uploader.upload(
      req.files.photos[i].tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

exports.adminAllUser = bigPromise(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminSingleUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUserUpdate = bigPromise(async (req, res, next) => {
  const update = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new CustomError("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
  
});

exports.adminUserDelete = bigPromise(async (req, res, next) => {
   
    const user = await User.deleteOne({id:req.params.id});
  
    if (!user) {
      return next(new CustomError("User not found", 404));
    }
    res.status(200).json({
      success: true,
      "message":"User is deleted"
    });
    
  });