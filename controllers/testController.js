const { validateTestContoller } = require("../models/ChallengeModel");

module.exports.testController = async (req, res) => {
  try {
    // validating the user's input(for make challenge form )
    const { error } = validateTestContoller(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const myObj = {
      name: req.body.name,
      file: req.file.path,
    };
    res.status(200).send(myObj);
  } catch (ex) {
    res.status(500).send("Something went wrong!");
    console.log(ex);
  }
};
