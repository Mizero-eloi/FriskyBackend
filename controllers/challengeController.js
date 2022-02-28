const {
  validateChallengePost,
  Challenge,
  validateChallengeSomeone,
} = require("../models/ChallengeModel");
const { User } = require("../models/User");
const _ = require("lodash");
const updateCollection = require("../reusable/updateCollection");
const { startSession } = require("mongoose");
const { object } = require("joi");

module.exports.makeChallenge = async (req, res, next) => {
  try {
    // validating the user's input(for make challenge form )
    const { error } = validateChallengePost(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the challenger(person making a challenge) is registered
    const challenger = await User.findById(req.body.challengerId);
    if (!challenger) return res.status(400).send("User does not exist");

    // formulating the open challenge object
    const challenge = new Challenge({
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

    // Saving the open challenge and returning the response to the client

    await challenge.save();
    res
      .status(200)
      .send(
        _.pick(challenge, [
          "challenger._id",
          "challenger.challengeVideo",
          "name",
          "prize",
          "deadLineToVote",
          "deadLineTimeToVote",
        ])
      );
  } catch (ex) {
    res.status(500).send("Something went wrong !!");
    console.log(ex);
  }
};

module.exports.postChallengeVideoWhileMakingChallenge = async (
  req,
  res,
  next
) => {
  //    await updateCollection(Challenge, req.params.challengeId, {"challenger.challengeVideo": req.file.path}, res);

  try {
    // Validating if the given challenge exists & updating if ever it finds the challenge
    const challenge = await Challenge.findByIdAndUpdate(req.params.challengeId);
    if (!challenge) return res.status(400).send("Challenge does not exist !");

    challenge.challenger.challengeVideo.push(req.file.path);

    // Saving the challenge
    await challenge.save();
    res.status(200).send(challenge);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
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
            name: participant.username,
            profile: participant.profile,
          },
        },
      },
      { new: true }
    );

    challenge = await Challenge.findOneAndUpdate(
      { _id: challenge._id, "participants.name": participant.username },
      {
        $push: {
          "participants.$.challengeVideo": req.file.path,
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
