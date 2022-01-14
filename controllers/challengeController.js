const { validateChallengePost, Challenge } = require("../models/ChallengeModel");
const { User } = require("../models/User");
const _ = require("lodash");
const updateCollection = require("../reusable/updateCollection");

module.exports.makeChallenge = async (req, res, next) => {
    try{
        // validating the user's input(for make challenge form )
        const { error } = validateChallengePost(req.body);
        if (error) return res.status(400).send(error.details[0].message);
    
        // Checking if the challenger(person making a challenge) is registered 
        const challenger = await User.findById(req.body.challengerId);
        if(!challenger) return res.status(400).send("User does not exist");
    
        // formulating the open challenge object 
        const challenge = new Challenge({
            challenger: {
                _id:challenger._id,
                name: "eloimizero" || null,
                profile: challenger.profile || null,
            },
            name: req.body.name,
            prize: req.body.prize || null ,
            type: req.body.type,
            deadLineToVote: req.body.deadLineToVote,
            deadLineTimeToVote: req.body.deadLineTimeToVote
        })
    
        // Saving the open challenge and returning the response to the client
    
        await challenge.save();
        res.status(200).send(_.pick(challenge, ["challenger._id","challenger.challengeVideo","name", "prize", "type", "deadLineToVote", "deadLineTimeToVote"]));

    }catch(ex){
        res.status(500).send("Something went wrong !!");
        console.log(ex);
    }


}
 


module.exports.postChallengeVideoWhileMakingChallenge = async (req, res, next) => { 
   await updateCollection(Challenge, req.params.challengeId, {"challenger.challengeVideo": req.file.path}, res);
   console.log("I've been called");
}



module.exports.uploadChallengeCoverPhoto = async (req, res, next) => { 
    await updateCollection(Challenge, req.params.challengeId, {"coverPhoto": req.file.path}, res);
}


module.exports.joinChallenge = async (req, res, next) => { 
    try{
    // Checking if the logged user is in our database
    const participant = await User.findById(req.user._id).select({username: 1, profile: 1, _id: 1});
    if(!participant) return res.status(400).send("User does not exist !");


    // checking if the given challenge exists 
    let challenge = await Challenge.findById(req.params.challengeId);
    if(!challenge) return res.status(400).send("Challenge does not exist !");
    
    // Checking if the user is not already in the competition 
    const competitor = challenge.participants.length > 0 && challenge.participants.filter(p => p._id == participant._id);
    if(competitor) return res.status(400).send("You are already a competitor");

    // Adding the participant to the competition

    challenge.participants.push({
            name: participant.username || "eloimizero",
            profile: participant.profile || "eloi's profile",
            challengeVideo: req.file.path
        })

    await challenge.save()
    
    
    res.status(200).send(challenge.participants); 

    }catch(ex){
        res.status(500).send("Something went wrong");
        console.log(ex);
    }


}