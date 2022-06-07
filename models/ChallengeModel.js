const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
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
          type: [
            new mongoose.Schema({
              name: {
                type: String,
              },
            }),
          ],
        },
        votes: {
          type: [
            new mongoose.Schema({
              name: {
                type: String,
                minlength: 5,
                maxlength: 50,
                required: true,
              },
            }),
          ],
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
    name: Joi.string().min(2).max(255).required(),
    prize: Joi.string().min(5).max(255).required(),
    challengeVideo: Joi.string(),
    deadLineToVote: Joi.date().required()
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

const validateComments = (comment) => {
  const schema = Joi.object().keys({
    message: Joi.string().min(1).max(1000),
  });

  return schema.validate(comment);
};
const validateremoveComment = (comment) => {
  const schema = Joi.object().keys({
    commentId: Joi.objectId().required(),
  });

  return schema.validate(comment);
};

const validateremoveVideo = (comment) => {
  const schema = Joi.object().keys({
    videoId: Joi.objectId().required(),
  });

  return schema.validate(comment);
};

const validateVote = (vote) => {
  const schema = Joi.object().keys({
    participant: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(vote);
};

module.exports.validateComments = validateComments;
module.exports.validateremoveComment = validateremoveComment;
module.exports.validateremoveVideo = validateremoveVideo;
module.exports.validateVote = validateVote;
module.exports.Challenge = Challenge;
module.exports.validateChallengePost = validateChallengePost;
module.exports.validateChallengeSomeone = validateChallengeSomeone;
