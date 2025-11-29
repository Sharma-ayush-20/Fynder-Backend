const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 25,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 25,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("please enter strong password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      validate(value) {
        if (value > 100 || value < 18) {
          throw new Error("Please enter age from 18 to 100");
        }
      },
    },
    gender: {
      type: String,
      lowercase: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender is invalid");
        }
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    memberShipType: {
      type: String,
      enum: ["silver", "gold"],
      default: null,
    },
    memberShipPeriod: {
      type: String,
      enum: ["monthly", "yearly"],
      default: null,
    },
    premiumExpiry: {
      type: Date,
      default: null,
    },
    about: {
      type: String,
      trim: true,
      default: "This is my About Section...",
      maxLength: 500,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error("Skills cannot be more than 10");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

//instance method for jwt
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

//instance method for verify password
userSchema.methods.verifyPassword = async function (password) {
  const user = this;
  const isMatchPassword = await bcrypt.compare(password, user.password);
  return isMatchPassword;
};

//hash the password automatically when change happen in password
userSchema.pre("save", async function (next) {
  const user = this;

  // agar password change hua hai tabhi hash kar
  if (!user.isModified("password")) return next();

  const saltRound = 10;
  const hashPassword = await bcrypt.hash(user.password, saltRound);
  user.password = hashPassword;
  next();
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
