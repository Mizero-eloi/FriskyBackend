const { User, validateUserEntry, checkEmail } = require("../models/User");
const bcrypt = require("bcrypt");

module.exports.userLogIn = async (req, res, next) => {

  let user;
  // verifying the user's input  and terminates if the verification fails
  const userInput = req.body.userInput;
  
  if (userInput.includes("@gmail.com") || userInput.includes("@yahoo.com")){
     // Verifying if the given email is correct
     user = await User.findOne({ email: req.body.userInput });
     if (!user) return res.status(400).send("no account associated with the provided email");
     
  }else{
     // Verifying if the given username is valid

     user = await User.findOne({ username: req.body.userInput });
     if (!user) return res.status(400).send("Incorrect username or password");
  }

  // Verifying if the password

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Incorrect username or password ");

  // returning a token to the user

  const token = user.generateAuthToken();

  return res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send("Logged In successfully !");

};
