// Get all documents
module.exports.getAllDocuments = async ({
  Collection,
  filter,
  fields,
  res,
}) => {
  try {
    const documents = await Collection.find(filter, fields);
    res.status(200).send(documents);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
};

// Get One Document

module.exports.getOneDocument = async (Collection, filter, res) => {
  try {
    const document = await Collection.findOne(filter);
    if (!document) res.status(400).send("Document does not exist !");
    res.status(200).send(document);
  } catch (ex) {
    res.send("Something went wrong exist!");
    console.log(ex);
  }
};

// Update collection using $set modifier
module.exports.updateCollection = async (Collection, id, updates, res) => {
  try {
    // Validating if the given challenge exists & updating if ever it finds the challenge
    const updatedObject = await Collection.findByIdAndUpdate(
      id,
      {
        $set: updates,
      },
      { new: true }
    );

    if (!updatedObject) return res.status(400).send("Document not found !");
    res.status(200).send(updatedObject);
  } catch (ex) {
    res.status(500).send("Something went wrong");
    console.log(ex);
  }
};

// Delete One document
module.exports.deleteDocument = async (Collection, id, res) => {
  try {
    const document = await Collection.findByIdAndRemove(id);
    res.status(200).send(document);
  } catch {
    res.status(500);
    res.send("Something went wrong!");
  }
};
