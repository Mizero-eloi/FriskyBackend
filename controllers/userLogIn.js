const { User, validateUserEntry, checkEmail } = require("../models/User");
const bcrypt = require("bcrypt");

module.exports.userLogIn = async (req, res, next) => {
  // verifying the user's input  and terminates if the verification fails
  const { error } = validateUserEntry(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user;

  //checking if the userInput is email or username
  const userInput = checkEmail(req.body.email);
  console.log("User input: " + userInput);
  if(userInput){

     // Verifying if the given email is correct
    user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("no account associated with the provided email");

  }

  // Verifying if the given username is correct

  user = await User.findOne({ username: req.body.email });
  if (!user) return res.status(400).send("Incorrect username or password");

  // Verifying if the password

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Incorrect username or password ");

  // returning a token to the user

  const token = user.generateAuthToken();

  return res.header("x-auth-token", token).send("Logged In successfully !");
};
