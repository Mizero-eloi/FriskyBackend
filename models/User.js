const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
const { toInteger } = require("lodash");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  username: {
    type: String,
    unique: true,
    minlength: 5,
    maxlength: 50,
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

  followers: {
    type: [
      new mongoose.Schema({
        username: {
          type: String,
          minlength: 5,
          maxlength: 50,
          required: true,
        },
      }),
    ],
  },

  following: {
    type: [
      new mongoose.Schema({
        username: {
          type: String,
          minlength: 5,
          maxlength: 50,
          required: true,
        },
      }),
    ],
  },

  wins: {
    type: Number,
    default: 0
  },

  gender: {
    type: String,
    enum: ["male", "female", "prefer not to say"],
    lowercase: true,
    minlength: 4,
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
  challengeRequests: {
    type: [
      new mongoose.Schema({
        challenger: {
          type: new mongoose.Schema({
            name: {
              type: String,
              minlength: 5,
              maxlength: 50,
              required: true,
            },
            profile: {
              type: String,
            },
            challengeVideo: {
              type: String,
            },
          }),
        },
        challenge: {
          type: String,
          required: true,
        },
        prize: {
          type: String,
          required: true,
        },
        isAccepted: {
          type: Boolean,
          default: false,
        },
      }),
    ],
  },
  profile: {
    type: String,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      profile: this.profile,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("user", userSchema);

const validateUserEntry = (user) => {
  const schema = Joi.object().keys({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(8).required(),
  });

  return schema.validate(user);
};

const validateUserProfile = (profile) => {
  const schema = Joi.object().keys({
    name: Joi.string().min(5).max(255).required(),
    username: Joi.string().min(5).max(50).required(),
    birthDate: Joi.date().required(),
    gender: Joi.string().min(4).max(50).required(),
    bio: Joi.string(),
  });

  return schema.validate(profile);
};

module.exports.User = User;
module.exports.validateUserEntry = validateUserEntry;
module.exports.validateUserProfile = validateUserProfile;
