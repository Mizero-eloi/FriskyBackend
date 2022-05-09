const { isEmpty } = require("lodash");
const { User } = require("../models/User");
const { getAllDocuments, updateCollectionPushToArray, updateCollectionPullFromArray } = require("../services/queries");

// Get all users
module.exports.getAllUsers = async (req, res) => {
  await getAllDocuments({
    Collection: User,
    fields: { password: 0 },
    res: res,
  });
};

//searching for user
module.exports.searchUser = async (req, res, next) => {

  //searching for the user
  let data = await User.find(
    {
      "$or": [
        {username: {$regex: req.body.UserToSearch}}
      ]
    });

    if(!isEmpty(data)){
      return res.status(200).send(data); 
    }else{
      return res.status(400).send("No user with such username");
    }

};

module.exports.follow = async (req, res, next) => {

  //user to follow
  const userToFollow = req.body.userToFollow;
  console.log("User to follow: " + userToFollow);

  // Getting the person who wants to follow someone
  const user = req.user.username;
  console.log("User : " + user);


  //Checking if there is a user with such username
  const isAvailable = await User.findOne({username: userToFollow});
  if(!isAvailable){
    res.status(400).send("The user doesn't exist");
  }
  console.log("the user is available "+ isAvailable);

  //checking if the user has not already followed 
  const follower = 
    isAvailable.followers.length > 0 &&
    isAvailable.followers.filter((f) => f.username == user);

  if(follower[0]){
    res.status(400).send("You've already followed this user");
  }

  //adding the user to userToFollow's followers
  updateCollectionPushToArray({
    Collection: User,
    filters: {
      "username": userToFollow
    },
    array: "followers",
    updates: {
      "username": user,
      "_id": req.user._id
    },
    res
  });

}

module.exports.unFollow = async (req, res, next) => {

  //user who was followed
  const userToUnFollow = req.body.userToUnFollow;
  console.log("User to follow: " + userToUnFollow);

  // Getting the person who is unfollowing
  const user = req.user.username;
  console.log("User : " + user);


  //Checking if there is a user with such username
  const isAvailable = await User.findOne({username: userToUnFollow});
  if(!isAvailable){
    res.status(400).send("The user doesn't exist");
  }
  console.log("the user is available "+ isAvailable);

  //checking if the user has already followed 
  const follower = 
    isAvailable.followers.length > 0 &&
    isAvailable.followers.filter((f) => f.username == user);

  if(!follower[0]){
    res.status(400).send("You haven't yet followed this user");
  }

  //removing the user from userToUnFollow's followers
  updateCollectionPullFromArray({
    Collection: User,
    filters:{
      "username": userToUnFollow
    },
    array: "followers",
    toBeRemoved: {
      username: user,
      _id: req.user._id
    },
    res,
  });

}