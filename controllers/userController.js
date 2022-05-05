const { isEmpty } = require("lodash");
const { User } = require("../models/User");
const { getAllDocuments } = require("../services/queries");

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
  //user input
  console.log(req.body.UserToSearch);
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
