const express = require("express");
const router = express.Router();
const { requireAuth } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");

// Middleware to authenticate users and save to MongoDB if new
const authenticateUser = async (req, res, next) => {
  try {
    const session = await requireAuth(req, res);
    const user = await User.findOne({ clerkId: session.userId });

    if (!user) {
      const newUser = new User({
        clerkId: session.userId,
        email: session.email,
        name: session.fullName,
      });
      await newUser.save();
      req.user = newUser;
    } else {
      req.user = user;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Example protected route
router.get("/profile", authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

// module.exports = router;
module.exports = authenticateUser;
