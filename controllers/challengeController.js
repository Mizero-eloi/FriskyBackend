const { validateChallengePost, Challenge, validateChallengeSomeone } = require("../models/ChallengeModel");
const { User } = require("../models/User");
const _ = require("lodash");
// const mongoose = require("mongoose");
// const Fawn = require("fawn");
const updateCollection = require("../reusable/updateCollection");


// Fawn.init("mongodb://localhost/Friskygoose");
module.exports.makeChallenge = async (req, res, next) => {
    try{
        // validating the user's input(for make challenge form )
        const { error } = validateChallengePost(req.body);
        if (error) return res.status(400).send(error.details[0].message);
    
        // Checking if the challenger(person making a challenge) is registered 
        const challenger = await User.findById(req.body.challengerId);
        if(!challenger) return res.status(400).send("User does not exist");

        // Checking if the challenge does already exist
        let challenge = await Challenge.findOne({name: req.body.name});
        if(challenge) return res.status(400).send("The Challenge does already exists");

        // formulating the open challenge object 
        challenge = new Challenge({
            challenger: {
                _id:challenger._id,
                name: challenger.username,
                profile: challenger.profile,
            },
            name: req.body.name,
            prize: req.body.prize || null ,
            deadLineToVote: req.body.deadLineToVote,
            deadLineTimeToVote: req.body.deadLineTimeToVote
        })
    
        // Saving the open challenge and returning the response to the client
    
        await challenge.save();
        res.status(200).send(_.pick(challenge, ["challenger._id","challenger.challengeVideo","name", "prize", "deadLineToVote", "deadLineTimeToVote"]));

    }catch(ex){
        res.status(500).send("Something went wrong !!");
        console.log(ex);
    }


}
 


module.exports.postChallengeVideoWhileMakingChallenge = async (req, res, next) => { 
//    await updateCollection(Challenge, req.params.challengeId, {"challenger.challengeVideo": req.file.path}, res);

    try{
        // Validating if the given challenge exists & updating if ever it finds the challenge
        const challenge = await Challenge.findByIdAndUpdate(req.params.challengeId);
        if(!challenge) return res.status(400).send("Challenge does not exist !");
    
        challenge.challenger.challengeVideo.push(req.file.path);
    
        // Saving the challenge
        await challenge.save();
        res.status(200).send(challenge);
        
    }catch(ex){
        res.status(500).send("Something went wrong");
        console.log(ex);    
    }
}



module.exports.uploadChallengeCoverPhoto = async (req, res, next) => { 
    await updateCollection(Challenge, req.params.challengeId, {"coverPhoto": req.file.path}, res);
}

module.exports.challengeSomeone = async (req, res, next) => {
    try{
        // validating the challenge inputs
        const { error } = validateChallengeSomeone(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        
        // Checking if the challenged person exists
        let thechallenged = await User.findOne({username: req.body.thechallenged});
        if (!thechallenged) return res.status(400).send("Oops ! user does not exists !");

        // Checking if the challenger is not the same as the challenged

        if(thechallenged.username === req.user.username) return res.status(403).send("Permission denied. You can not challenge yourself");

        
        // Checking if the challenge does already exist
        let challenge = await Challenge.findOne({name: req.body.name});
        if(challenge) return res.status(400).send("The Challenge does already exists");
        

        
        // Creating the challenge 

        challenge = new Challenge({
            challenger: {
                _id:req.user._id,
                name: req.user.username,
                profile: req.user.profile,
            },
            thechallenged:{
                _id: thechallenged._id,
                name: thechallenged.username,
                profile: thechallenged.profile,

            },
            name: req.body.name,
            prize: req.body.prize,
            
        })


        // Saving the challenge 
        await challenge.save()
        return res.status(200).send(challenge);

    }catch(ex){
        res.status(500).send("Something went wrong !!");
        console.log(ex);

    }


 }


module.exports.joinChallenge = async (req, res, next) => { 
    try{
    // Checking if the logged user is in our database
    const participant = req.user;

    // checking if the given challenge exists 
    let challenge = await Challenge.findById(req.params.challengeId);
    if(!challenge) return res.status(400).send("Challenge does not exist !");
    
    // Checking if the user is not already in the competition 
    let competitor = challenge.participants.length > 0 && challenge.participants.filter(p => p._id == participant._id);
    if(competitor) return res.status(400).send("You are already a competitor");

    
    challenge = await Challenge.findByIdAndUpdate(challenge._id, {
        $push: {
            participants: {
                name: participant.username,
                profile: participant.profile
            }
        }
    }, {new: true})


    challenge = await Challenge.findOneAndUpdate({_id: challenge._id, "participants.name": participant.username}, {
        $push: {
            "participants.$.challengeVideo": req.file.path
        }
    }, {new: true})

    
    res.status(200).send(challenge.participants); 

    }catch(ex){
        res.status(500).send("Something went wrong");
        console.log(ex);
    }


}


module.exports.unJoinChallenge = async (req, res, next) => {

    try{
        // Checking if the logged user is in our database
        const participant = req.user;
    
        // checking if the given challenge exists 
        let challenge = await Challenge.findById(req.params.challengeId);
        if(!challenge) return res.status(400).send("Challenge does not exist !");
        
        // Checking if the user is in the competition 
        let competitor = challenge.participants.length > 0 && challenge.participants.filter(p => p._id == participant._id);
        if(!competitor) return res.status(400).send("You are not  in a  competition");
    
        
        challenge = await Challenge.findByIdAndUpdate(challenge._id, {
            $pull: {
                participants: {
                    name: participant.username
                }
            }
        }, {new: true})
    
        
        res.status(200).send(challenge.participants); 
    
        }catch(ex){
            res.status(500).send("Something went wrong");
            console.log(ex);
        }
    

 }