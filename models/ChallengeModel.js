const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    unique: true,
    required: true,
  },
  prize: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },

  deadLineToVote: {
    type: Date,
  },
  deadLineTimeToVote: {
    type: String,
    match: /^([01]\d|2[0-3]):?([0-5]\d)$/,
  },
  coverPhoto: {
    type: String,
  },
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
        type: [String],
      },
      votes: {
        type: [String],
      },
    }),
  },
  thechallenged: {
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
    }),
  },
  participants: {
    type: [
      new mongoose.Schema({
        name: {
          type: String,
          minlength: 5,
          maxlength: 50,
          required: true,
        },
        profile: {
          type: String,
          minlength: 5,
          maxlength: 50,
        },
        challengeVideo: {
          type: [String],
        },
        votes: {
          type: [String],
        },
      }),
    ],
  },
  comments: {
    type: [
      new mongoose.Schema({
        commenter: {
          type: String,
          minlength: 5,
          maxlength: 50,
        },
        message: {
          type: String,
          minlength: 1,
          maxlength: 1000,
        },
      }),
    ],
  },
});

const Challenge = mongoose.model("challenge", challengeSchema);

const validateChallengePost = (challenge) => {
  const schema = Joi.object().keys({
    challengerId: Joi.objectId().required(),
    name: Joi.string().min(2).max(255).required(),
    prize: Joi.string().min(5).max(255).required(),
    deadLineToVote: Joi.date().required(),
    deadLineTimeToVote: Joi.string()
      .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/)
      .required(),
  });

  return schema.validate(challenge);
};

const validateChallengeSomeone = (challenge) => {
  const schema = Joi.object().keys({
    name: Joi.string().min(2).max(255).required(),
    thechallenged: Joi.string().min(5).max(50).required(),
    prize: Joi.string().min(2).max(255).required(),
    challengeVideo: Joi.string(),
  });

  return schema.validate(challenge);
};

module.exports.Challenge = Challenge;
module.exports.validateChallengePost = validateChallengePost;
module.exports.validateChallengeSomeone = validateChallengeSomeone;
