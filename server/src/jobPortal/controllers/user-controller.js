import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDataUri, v2 as cloudinary } from "#utils";
import { UserModel as User } from "#jobPortal/models";
import { asyncErrorHandler, ErrorHandler } from "#ecommerece/middlewares";

const register = asyncErrorHandler(async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return new ErrorHandler(400, "Something is missing");
    }
    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    const user = await User.findOne({ email });
    if (user) {
      return new ErrorHandler(400, "User already exist with this email.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    return new ErrorHandler(500, error);
  }
});
const login = asyncErrorHandler(async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return new ErrorHandler(400, "Something is missing");
    }
    let user = await User.findOne({ email });
    if (!user) {
      return new ErrorHandler(400, "Incorrect email or password.");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return new ErrorHandler(400, "Incorrect email or password.");
    }
    // check role is correct or not
    if (role !== user.role) {
      return new ErrorHandler(400, "Account doesn't exist with current role.");
    }

    const tokenData = {
      userId: user._id,
    };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    return new ErrorHandler(500, error);
  }
});
const logout = asyncErrorHandler(async (req, res) => {
  try {
    return res.status(200).cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    return new ErrorHandler(500, error);
  }
});
const updateProfile = asyncErrorHandler(async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id; // middleware authentication
    let user = await User.findById(userId);

    if (!user) {
      return new ErrorHandler(400, "User not found.");
    }
    // updating data
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    // resume comes later here...
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
      user.profile.resumeOriginalName = file.originalname; // Save the original file name
    }

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    return new ErrorHandler(500, error);
  }
});

const userController = {
  register,
  login,
  logout,
  updateProfile,
};
export default userController;
