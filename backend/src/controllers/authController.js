import User from "../models/User.js";
import { getDBStatus } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { sendResponse } from "../utils/apiResponse.js";

const authPayload = (user) => ({
  token: generateToken(user._id),
  user
});

export const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim().toLowerCase();

    if (!name?.trim() || !normalizedUsername || !normalizedEmail || !password) {
      return sendResponse(res, 400, "All fields are required");
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser) {
      return sendResponse(res, 409, "Email or username already exists");
    }

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password
    });
    const safeUser = await User.findById(user._id).select("-password");

    sendResponse(res, 201, "Account created successfully", authPayload(safeUser));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return sendResponse(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      if (!user && getDBStatus().isLocalFallback) {
        return sendResponse(
          res,
          401,
          "Invalid credentials. Atlas is unreachable, so the backend is using an empty local database. Register again locally or allowlist your IP in MongoDB Atlas."
        );
      }

      return sendResponse(res, 401, "Invalid credentials");
    }

    const safeUser = await User.findById(user._id).select("-password");
    sendResponse(res, 200, "Logged in successfully", authPayload(safeUser));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  sendResponse(res, 200, "Current user loaded", req.user);
};
