const jwt = require("jsonwebtoken");
const UserModel = require("../models/user-models");

const userAuth = async (req, res, next) => {
  try {
    //take the token
    const { token } = req.cookies;
    //check token is availabe or not
    if (!token) {
      return res.status(400).json({ message: "Please Login..." });
    }
    //decode the token details
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodeToken) {
      return res.status(400).json({ message: "Token Not Decoded" });
    }
    //find user by userid
    const { _id } = decodeToken;
    const user = await UserModel.findById(_id);
    //check user is available
    if (!user) {
      return res.status(400).json({ message: "User not found!!!" });
    }
    //inject user in req
    req.user = user;
    next();
  } catch (error) { res.status(400).send("ERROR: " + error.message);}
};

module.exports = { userAuth };
