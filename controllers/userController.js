const { isEmpty } = require("lodash");
const { User } = require("../models/User");
const { getAllDocuments, updateCollectionPushToArray, updateCollectionPullFromArray } = require("../services/queries");
const { startSession } = require("mongoose");
const { Challenge } = require("../models/ChallengeModel");

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

  // Getting the person who wants to follow someone
  const user = req.user.username;


  //Checking if there is a user with such username
  const isAvailable = await User.findOne({username: userToFollow});
  if(!isAvailable) return res.status(400).send("The user doesn't exist");
  

  //checking if the user has not already followed 
  const follower = 
    isAvailable.followers.length > 0 &&
    isAvailable.followers.filter((f) => f.username == user);

  if(follower[0]) return res.status(400).send("You've already followed this user");

      // Creating a session for a transaction
      const session = await startSession();

      const transactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConern: { w: "majority" },
      };
  
      try{
  
        const transactionResults = await session.withTransaction(async () => {


          //adding the user to userToFollow's followers
          const user_being_followed = await User.findOneAndUpdate(
            { username: userToFollow},
            {
              $push: {
                "followers": {
                  username: user,
                  _id: req.user._id
                },
              },
            },
            { session, new: true }
          );

          if (!user_being_followed) {
            session.abortTransaction();
            return res
              .status(400)
              .send("Xorry, there was no request to this challenge!");
          }

          //adding the user to userToFollow's following

          const user_following = await User.findOneAndUpdate(
            { username: user},
            {
              $push: {
                "following": {
                  username: userToFollow,
                  _id: isAvailable._id
                },
              },
            },
            { session, new: true }
          );

          
          if (!user_following) {
            session.abortTransaction();
            return res
              .status(400)
              .send("Xorry, there is no user with this username!");
          }

          res.status(200).send(user_following);
          
        }, transactionOptions);

        if (transactionResults) {
          console.log("My transaction worked successfully");
        } else {
          console.log("The transaction was intentionally aborted !!");
        }
        
      }catch(ex){
        res.status(500).send("Something went wrong !");
        console.log("The transaction was aborted due to some errors " + ex);
      }finally {
        await session.endSession();
      }
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

  //checking if the user has already followed 
  const follower = 
    isAvailable.followers.length > 0 &&
    isAvailable.followers.filter((f) => f.username == user);

  if(!follower[0]){
    res.status(400).send("You haven't yet followed this user");
  }

   // Creating a session for a transaction
   const session = await startSession();

   const transactionOptions = {
     readPreference: "primary",
     readConcern: { level: "local" },
     writeConern: { w: "majority" },
   };

   try{

     const transactionResults = await session.withTransaction(async () => {


       //removing the user to userToFollow's followers
       const user_being_unFollowed = await User.findOneAndUpdate(
         { username: userToUnFollow},
         {
           $pull: {
             "followers": {
               username: user,
               _id: req.user._id
             },
           },
         },
         { session, new: true }
       );

       if (!user_being_unFollowed) {
         session.abortTransaction();
         return res
           .status(400)
           .send("Xorry, there is no user with this username!");
       }

       //removing the userToUnFollow's from user following

       const user_unFollowing = await User.findOneAndUpdate(
         { username: user},
         {
           $pull: {
             "following": {
               username: userToUnFollow,
               _id: isAvailable._id
             },
           },
         },
         { session, new: true }
       );

       
       if (!user_unFollowing) {
         session.abortTransaction();
         return res
           .status(400)
           .send("Xorry, there is no user with such a username!");
       }

       res.status(200).send(user_unFollowing);
       
     }, transactionOptions);

     if (transactionResults) {
       console.log("My transaction worked successfully");
     } else {
       console.log("The transaction was intentionally aborted !!");
     }
     
   }catch(ex){
     res.status(500).send("Something went wrong !");
     console.log("The transaction was aborted due to some errors " + ex);
   }finally {
     await session.endSession();
   }

}

module.exports.getAllParticipatedInChallenges = async (req, res) => {
  const username = req.user.username;
  const challenges = await Challenge.find();
  const length = challenges.length;
  let i = 0;
  let allParticipatedInChallenges=[];

  for(i; i<length; i++){
    if(await challenges[i].participants.filter((p) => p.name == username)){
      allParticipatedInChallenges.push(challenges[i]);
    }
  }


  if(!allParticipatedInChallenges){
    res
    .status(400)
    .send("Xorry, You haven't participated in any challenges.");
  }

  console.log("All challenges participated in by "+ username +": " + allParticipatedInChallenges);

  return res.status(200).send(allParticipatedInChallenges);

}