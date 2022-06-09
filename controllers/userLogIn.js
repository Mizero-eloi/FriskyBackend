const { User, validateUserEntry } = require("../models/User");
const bcrypt = require("bcrypt");

module.exports.userLogIn = async (req, res, next) => {
  // verifying the user's input  and terminates if the verification fails
  const { error } = validateUserEntry(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Verifying if the given email is correct

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Incorrect username or password ");

  // Verifying if the password

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Incorrect username or password ");

  // returning a token to the user

  const token = user.generateAuthToken();

  return res
    .header("x-auth-token", token)
    .header("access-control-expose-headers")
    .send("Logged In successfully !");
};
