module.exports = async (Collection, id, updates, res) => {
    try{
        // Validating if the given challenge exists & updating if ever it finds the challenge
        const updatedObject = await Collection.findByIdAndUpdate(id, {
            $set: updates
        }, {new: true});

        if(!updatedObject) return res.status(400).send("Document not found !");
        res.status(200).send(updatedObject);
    
    }catch(ex){
        res.status(500).send("Something went wrong");
        console.log(ex);
    }
      
}

