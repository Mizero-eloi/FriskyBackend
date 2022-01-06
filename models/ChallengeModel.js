const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const challengeSchema = new mongoose.Schema({
  name: {
   type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  type: {
    type: String,
    enum: ["open", "closed"],
    lowercase: true,
    required: true
  },
  prize: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },

  deadLineToVote: {
    type: Date,
    required: true
  },
  deadLineTimeToVote:{
     type: String,
     match:/^([01]\d|2[0-3]):?([0-5]\d)$/,
     required: true
     
  },
  coverPhoto:{
     type:String
  },
  challenger: {
      type: new mongoose.Schema({
         name: {
            type: String,
            minlength: 5,
            maxlength: 50,
            required: true
         },
         profile: {
            type: String,
            minlength: 5,
            maxlength: 50, 
         },
         challengeVideo: {
            type: String,
         },
         votes: {
           type: [String]
         },
         

      })

  },
  participants: {
      type: [new mongoose.Schema({
         name: {
            type: String,
            minlength: 5,
            maxlength: 50,
            required: true
         },
         profile: {
            type: String,
            minlength: 5,
            maxlength: 50,
         },
         challengeVideo: {
            type: String,
            required: true
         },
         votes: {
           type: [String]
         },


      })]

  },
  comments: {
      type: [new mongoose.Schema({
        commenter: {
            type: String,
            minlength: 5,
            maxlength: 50,
         },
         message:{
            type: String,
            minlength: 1,
            maxlength: 1000,

         }
      })]

  },
  


});



const Challenge = mongoose.model("challenge", challengeSchema);

const validateChallengePost = (challenge) => {
  const schema = Joi.object().keys({
    challengerId: Joi.objectId().required(),
    name: Joi.string().min(2).max(255).required(),
    type: Joi.string().min(4).max(6).required(),
    prize: Joi.string().min(5).max(255).required(),
    deadLineToVote: Joi.date().required(),
    deadLineTimeToVote: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).required()
  });

  return schema.validate(challenge);
};



module.exports.Challenge = Challenge;
module.exports.validateChallengePost = validateChallengePost;

