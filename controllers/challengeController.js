const {
  validateChallengePost,
  Challenge,
  validateChallengeSomeone,
  validateComments,
  validateVote,
  validateremoveComment,
  validateremoveVideo,
} = require("../models/ChallengeModel");
const { User } = require("../models/User");
const _ = require("lodash");
const {
  updateCollection,
  getAllDocuments,
  getOneDocument,
  deleteDocument,
} = require("../services/queries");
const { startSession } = require("mongoose");

module.exports.createChallenge = async (req, res, next) => {
  // validating the user's input(for make challenge form )
  const { error } = validateChallengePost(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Validate the challengeVideo
  if (!req.file) return res.status(400).send("challengeVideo is required !");

  // Assigning the currently logged in user to challenge

  const challenger = req.user;

  // Creating a session for a transaction
  const session = await startSession();

  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConern: { w: "majority" },
  };

  try {
    const transactionResults = await session.withTransaction(async () => {
      // formulating the open challenge object
      let challenge = new Challenge({
        challenger: {
          _id: challenger._id,
          name: challenger.username,
          profile: challenger.profile,
        },
        name: req.body.name,
        prize: req.body.prize || null,
        deadLineToVote: req.body.deadLineToVote,
        deadLineTimeToVote: req.body.deadLineTimeToVote,
      });
      // Saving the challenge
      let result = await challenge.save({ session });

      if (!result) {
        session.abortTransaction();
        return res.status(400).send("Oops! Failed to save the challenge ");
      }
      console.log(
        "################### Result got from saving a challenge ###################",
        result
      );

      // ================ Performing another task

      // Checking if the user is not already in the competition
      let competitor =
        challenge.participants.length > 0 &&
        challenge.participants.filter((p) => p._id == challenger._id);
      if (competitor) {
        return res.status(400).send("You are already a competitor");
      }

      // Adding the creator to the participant array

      challenge = await Challenge.findByIdAndUpdate(
        challenge._id,
        {
          $push: {
            participants: {
              _id: challenger._id,
              name: challenger.username,
              profile: challenger.profile,
              challengeVideo: { name: req.file.path },
            },
          },
        },
        { session, new: true }
      );

      res.status(200).send(challenge);
    }, transactionOptions);

    // Verifying if  the transaction worked as expected

    if (transactionResults) {
      console.log("My transaction worked successfully");
    } else {
      console.log("The transaction was intentionally aborted !!");
    }
  } catch (ex) {
    res.status(500).send("Something went wrong !");
    console.log("The transaction was aborted due to some errors " + ex);
  } finally {
    await session.endSession();
  }
};

// Get all challenges
module.exports.getAllChallenges = async (req, res) => {
  await getAllDocuments({ Collection: Challenge, res });
};

// Get one document

module.exports.getOneChallenge = async (req, res) => {
  // checking if the given challenge exists
  let challenge = await Challenge.findById(req.params.challengeId);
  if (!challenge) return res.status(400).send("Challenge does not exist !");

  getOneDocument(Challenge, { _id: req.params.challengeId }, res);
};

// Delete one document

module.exports.deleteChallenge = async (req, res) => {
  // checking if the given challenge exists
  let challenge = await Challenge.findById(req.params.challengeId);
  if (!challenge) return res.status(400).send("Challenge does not exist !");

  deleteDocument(Challenge, req.params.challengeId, res);
};

module.exports.uploadChallengeCoverPhoto = async (req, res, next) => {
  await updateCollection(
    Challenge,
    req.params.challengeId,
    { coverPhoto: req.file.path },
    res
  );
};

module.exports.challengeSomeone = async (req, res, next) => {
  try {
    // validating the challenge inputs
    const { error } = validateChallengeSomeone(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const challenger = req.user;

    // Checking if the challenged person exists
    let theChallenged = await User.findOne({
      username: req.body.thechallenged,
    });
    if (!theChallenged)
      return res.status(400).send("Oops ! user does not exists !");

    // Checking if the challenger is not the same as the challenged

    if (theChallenged.username === req.user.username)
      return res
        .status(403)
        .send("Permission denied. You can not challenge yourself");

    // Checking if the challengeVideo is included
    if (!req.file)
      return res
        .status(400)
        .send("You should include a challenge video to challenge someone");

    // Requesting theChallenged user to be challenged
    theChallenged = await User.findByIdAndUpdate(
      theChallenged._id,
      {
        $push: {
          challengeRequests: {
            challenger: {
              _id: challenger._id,
              name: challenger.username,
              profile: challenger.profile,
              challengeVideo: req.file.path,
            },
            challenge: req.body.name,
            prize: req.body.prize,
          },
        },
      },
      { new: true }
    );

    // Saving the open challenge and returning the response to the client

    res.status(200).send(theChallenged.challengeRequests);
  } catch (ex) {
    res.status(500).send("Something went wrong !!");
    console.log(ex);
  }
};

module.exports.joinChallenge = async (req, res, next) => {
  try {
    // Checking if the logged user is in our database
    const participant = req.user;

    // checking if the given challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    // Checking if the user is the owner of the challenge
    if (challenge.challenger.name === participant.username)
      return res
        .status(400)
        .send("You automatically join the challenge after creating it!");

    // Checking if the user is not already in the competition
    let competitor =
      challenge.participants.length > 0 &&
      challenge.participants.filter((p) => p._id == participant._id);
    if (competitor) return res.status(400).send("You are already a competitor");

    challenge = await Challenge.findByIdAndUpdate(
      challenge._id,
      {
        $push: {
          participants: {
            _id: participant._id,
            name: participant.username,
            profile: participant.profile,
            challengeVideo: { name: req.file.path },
          },
        },
      },
      { new: true }
    );

    res.status(200).send(challenge.participants);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
};

module.exports.addVideoToChallenge = async (req, res, next) => {
  try {
    // checking if the given challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    // Checking if the user is not already in the competition
    const participant =
      challenge.participants.length > 0 &&
      challenge.participants.filter((p) => p.name == req.user.username);
    if (!participant[0]) return res.status(400).send("Paricipant not found!");

    challenge = await Challenge.findOneAndUpdate(
      { _id: challenge._id, "participants.name": participant[0].username },
      {
        $push: {
          "participants.$.challengeVideo": { name: req.file.path },
        },
      },
      { new: true }
    );

    // Returning the challenge to the client
    res.status(200).send(challenge);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
};

module.exports.removeVideoFromChallenge = async (req, res, next) => {
  try {
    // validating the removeVideo
    const { error } = validateremoveVideo(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // checking if the given challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    // checking if the participant exists
    const participant =
      challenge.participants.length > 0 &&
      challenge.participants.filter((p) => p.name == req.user.username);

    if (!participant[0]) return res.status(400).send("Paricipant not found!");

    // Checking if the given video in the participant array
    const video =
      participant[0].challengeVideo.length > 0 &&
      participant[0].challengeVideo.filter((v) => v._id == req.body.videoId);

    if (!video[0]) return res.status(400).send("Video not found!");

    challenge = await Challenge.findOneAndUpdate(
      { _id: challenge._id, "participants.name": participant.username },
      {
        $pull: {
          "participants.$.challengeVideo": { _id: req.body.videoId },
        },
      },
      { new: true }
    );

    // Returning the challenge to the client
    res.status(200).send(challenge);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
};

module.exports.unJoinChallenge = async (req, res, next) => {
  try {
    // Checking if the logged user is in our database
    const participant = req.user;

    // checking if the given challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    // Checking if the user is in the competition
    let competitor =
      challenge.participants.length > 0 &&
      challenge.participants.filter((p) => p._id == participant._id);
    if (!competitor)
      return res.status(400).send("You are not  in a  competition");

    challenge = await Challenge.findByIdAndUpdate(
      challenge._id,
      {
        $pull: {
          participants: {
            name: participant.username,
          },
        },
      },
      { new: true }
    );

    res.status(200).send(challenge.participants);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
};
//comments in challenge
module.exports.comment = async (req, res, next) => {
  try {
    //adding comment to the comment section of the challenge
    const commenter = req.user.username;
    const message = req.body.message;

    // console.log("Message: "+ message)
    // challenge.comments.push(commentGroup);

    // validating the input message
    const { error } = validateComments(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const challenge = await Challenge.findByIdAndUpdate(
      req.params.challengeId,
      {
        $push: {
          comments: {
            commenter,
            message,
          },
        },
      },
      { new: true }
    );

    // Verifying if the challenge exists in the database !

    if (!challenge) return res.status(400).send("Challenge does not exist");

    return res.status(200).send(challenge);
  } catch (e) {
    res.status(500).send("Something went wrong!");
    console.log(e);
  }
};
module.exports.removeComment = async (req, res, next) => {
  try {
    // validating the input message
    const { error } = validateremoveComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist!");

    // Searching for a comment in the challenge
    const comments =
      challenge.comments.length > 0 &&
      challenge.comments.filter((c) => c._id == req.body.commentId);
    if (!comments[0]) return res.status(400).send("Comment not found !");

    challenge = await Challenge.findOneAndUpdate(
      { _id: req.params.challengeId, "comments._id": req.body.commentId },
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    );

    // Verifying if the challenge exists in the database !
    if (!challenge) return res.status(400).send("Challenge does not exist");

    return res.status(200).send(challenge);
  } catch (e) {
    res.status(500).send("Something went wrong!");
    console.log(e);
  }
};

// Getting all comments of a given challenge

module.exports.getAllComments = async (req, res, next) => {
  try {
    // Checking if the challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist!");

    // Getting all comments
    getAllDocuments({
      Collection: Challenge,
      filter: { _id: challenge._id },
      fields: { comments: 1 },
      res,
    });
  } catch (ex) {
    res.status(500).send("something went wrong!");
    console.log(ex);
  }
};
//adding votes to the participants votes
module.exports.vote = async (req, res, next) => {
  try {
    // validating the user's input(for make challenge form )
    const { error } = validateVote(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // checking if the given challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    // Checking if the user is not already in the competition
    let participant =
      challenge.participants.length > 0 &&
      challenge.participants.filter((p) => p.name == req.body.participant);
    if (!participant[0]) return res.status(400).send("Paricipant not found!");

    // Checking if the user hasn't voted the given participant already
    const vote =
      participant[0].votes.length > 0 &&
      participant[0].votes.filter((v) => v.name == req.user.username);

    if (vote[0])
      return res.status(400).send("You have already voted this participant");

    // Pushing the vote into votes array
    challenge = await Challenge.findOneAndUpdate(
      { _id: challenge._id, "participants.name": req.body.participant },
      {
        $push: {
          "participants.$.votes": {
            _id: req.user._id,
            name: req.user.username,
          },
        },
      },
      { new: true }
    );

    // Returning the challenge to client
    res.status(200).send(challenge);
  } catch (e) {
    res.status(500).send("Something went wrong!");
    console.log(e);
  }
};

//removing votes to the participants votes
module.exports.removeVote = async (req, res, next) => {
  try {
    // validating the user's input(for make challenge form )
    const { error } = validateVote(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // checking if the given challenge exists
    let challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    // Checking if the user is not already in the competition
    let participant =
      challenge.participants.length > 0 &&
      challenge.participants.filter((p) => p.name == req.body.participant);
    if (!participant[0]) return res.status(400).send("Paricipant not found!");

    // Checking if the user hasn't voted the given participant already
    const vote =
      participant[0].votes.length > 0 &&
      participant[0].votes.filter((v) => v.name == req.user.username);

    if (!vote[0])
      return res.status(400).send("You did not vote this participant");

    // Pushing the vote into votes array
    challenge = await Challenge.findOneAndUpdate(
      { _id: challenge._id, "participants.name": req.body.participant },
      {
        $pull: {
          "participants.$.votes": {
            _id: req.user._id,
            name: req.user.username,
          },
        },
      },
      { new: true }
    );

    // Returning the challenge to client
    res.status(200).send(challenge);
  } catch (e) {
    res.status(500).send("Something went wrong!");
    console.log(e);
  }
};

//searching for user
module.exports.searchUser = async (req, res, next) => {
  //user input
  const userPattern = new ReqExp("^" + req.body.query);

  //searching for the user
  User.find({ username: { $regex: userPattern } })
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((err) => {
      return res.status(404).send("User not found", err[0].message);
    });
};

//searching for challenge
module.exports.searchUser = async (req, res, next) => {
  //user input
  const userPattern = new ReqExp("^" + req.body.query);

  //searching for the user
  Challenge.find({ name: { $regex: userPattern } })
    .then((challenge) => {
      return res.status(200).send(challenge);
    })
    .catch((err) => {
      return res.status(404).send("User not found", err[0].message);
    });
};
module.exports.acceptChallenge = async (req, res, next) => {
  // Creating a session for a transaction
  const session = await startSession();

  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConern: { w: "majority" },
  };

  try {
    const transactionResults = await session.withTransaction(async () => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id, "challengeRequests._id": req.params.challengeId },
        {
          $set: {
            "challengeRequests.$.isAccepted": true,
          },
        },
        { session, new: true }
      );

      if (!updatedUser) {
        session.abortTransaction();
        return res
          .status(400)
          .send("Xorry, there was no request to this challenge!");
      }

      // fetching the actual challenge request in the user challenge requests
      console.log(
        "all of the challengeRequests: " + updatedUser.challengeRequests[0]
      );

      const challengeRequest = await updatedUser.challengeRequests.filter(
        (r) => r._id == req.params.challengeId
      );
      if (!challengeRequest) {
        session.abortTransaction();
        return res.status(400).send("challenge request does not exist !");
      }

      const challenge = new Challenge({
        challenger: {
          _id: challengeRequest[0].challenger._id,
          name: challengeRequest[0].challenger.name,
          profile: challengeRequest[0].challenger.profile,
        },
        name: challengeRequest[0].challenge,
        prize: challengeRequest[0].prize,
      });

      await challenge.save({ session });

      res.status(200).send(challenge);
    }, transactionOptions);

    if (transactionResults) {
      console.log("My transaction worked successfully");
    } else {
      console.log("The transaction was intentionally aborted !!");
    }
  } catch (ex) {
    res.status(500).send("Something went wrong !");
    console.log("The transaction was aborted due to some errors " + ex);
  } finally {
    await session.endSession();
  }
};
