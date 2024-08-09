const User = require("../models/userModal");
const jwt = require("jsonwebtoken");
const {
  CreateUsername,
  createJWT,
  ComparePassword,
  hashedPassword,
} = require("../services/utilities.service");
const {loginSchema,registerSchema}=require('../services/validate')
require("dotenv").config();

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const validation = await loginSchema.validate(req.body);
    //validation error
    if (validation.error) {
      return res.status(403).json({
        message: validation.error.message,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    const isMatch = await ComparePassword(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "email and password does not match" });
    }
    const token = await createJWT(user);
    return res.json({ token, user });
  } catch (err) {
    console.log(err);
  }
};
const Signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const validation = await registerSchema.validate(req.body);
    if (validation.error) {
      return res.status(403).json({ message: validation.error.message });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: "User already exists" });
    }
    const username = CreateUsername();
    const Password = await hashedPassword(password);
    const newUser = new User({
      username,
      email,
      password: Password,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUsers=async(req,res)=>{
  try{
    const user=await User.find()
    res.json(user)
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  Login,
  Signup,
  getUsers
};