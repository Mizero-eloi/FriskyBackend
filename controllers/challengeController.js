const { validateChallengePost, Challenge } = require("../models/ChallengeModel");
const { User } = require("../models/User");
const _ = require("lodash");

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
    try{
        // Validating if the given challenge exists & updating if ever it finds the challenge
        const challenge = await Challenge.findByIdAndUpdate(req.params.challengeId, {
            $set:{
                "challenger.challengeVideo": req.file.path
            }
        }, {new: true});
    
        res.status(200).send(challenge);

    }catch(ex){
        res.status(500).send("Something went wrong");
        console.log(ex);
    }

}


module.exports.uploadChallengeCoverPhoto = async (req, res, next) => { 
    try{
        // Validating if the given challenge exists & updating if ever it finds the challenge
        const challenge = await Challenge.findByIdAndUpdate(req.params.challengeId, {
            $set:{
                "coverPhoto": req.file.path
            }
        }, {new: true});
    
        res.status(200).send(challenge);

    }catch(ex){
        res.status(500).send("Something went wrong");
        console.log(ex);
    }

}



