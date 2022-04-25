const { User, validateUserProfile } = require("../models/User");
const { updateCollection } = require("../services/queries");

module.exports.userProfile = async (req, res, next) => {
  // validate the user's given data and return if it is not valid
  const { error } = validateUserProfile(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the profile matches the user updating it
  if (req.user._id != req.params.userId)
    return res
      .status(403)
      .send("You are not authorised to perform this action");

  // Checking if the username does already exists
  const user = await User.findOne({ username: req.body.username });
  console.log("The username: " + req.user.username);
  if (user && user.username !== req.user.username)
    return res.status(400).send("username does already exists ! ");

  // updating the user's profile
  await updateCollection(
    User,
    req.params.userId,
    {
      name: req.body.name,
      username: req.body.username,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      bio: req.body.bio,
    },
    res
  );
};

module.exports.updateUserProfilePicture = async (req, res, next) => {
  await updateCollection(
    User,
    req.params.userId,
    { profile: req.file.path },
    res
  );
};
