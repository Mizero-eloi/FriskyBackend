const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  username: {
    type: String,
    minlength: 5,
    maxlength: 50,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },

  birthDate: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },

  gender: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1000,
  },
  bio: {
    type: String,
    minlength: 5,
    maxlength: 1000,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("user", userSchema);

const validateUserRegistration = (user) => {
  const schema = Joi.object().keys({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(8).required(),
  });

  return schema.validate(user);
};

const validateUserLogIn = (user) => {
  const schema = Joi.object().keys({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(8).required(),
  });

  return schema.validate(user);
};

module.exports.User = User;
module.exports.validateUserRegistration = validateUserRegistration;
module.exports.validateUserLogIn = validateUserLogIn;
