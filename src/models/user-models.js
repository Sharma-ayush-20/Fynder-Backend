const mongoose = require("mongoose");
const validator = require("validator");

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
      validate(value){
        if(!validator.isEmail(value)){
          throw new Error("Email is not valid")
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value){
        if(!validator.isStrongPassword(value)){
          throw new Error("please enter strong password")
        }
      }
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
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

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
