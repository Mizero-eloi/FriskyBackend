// Get all documents
module.exports.getAllDocuments = async ({
  Collection,
  filter,
  fields,
  res,
}) => {
  const documents = await Collection.find(filter, fields);
  res.status(200).send(documents);
};

// Get One Document

module.exports.getOneDocument = async (Collection, filter, res) => {
  const document = await Collection.findOne(filter);
  if (!document) res.status(400).send("Document does not exist !");
  res.status(200).send(document);
};

// Update collection using $set modifier
module.exports.updateCollection = async (Collection, id, updates, res) => {
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
};

// Update collection using $push modifier
module.exports.updateCollectionPushToArray = async ({
  Collection,
  filters,
  array,
  updates,
  res,
}) => {
  // Validating if the given challenge exists & updating if ever it finds the challenge
  const updatedObject = await Collection.findOneAndUpdate(
    filters,
    {
      $push: {
        [array]: updates,
      },
    },
    { new: true }
  );

  if (!updatedObject) return res.status(400).send("Document not found !");
  res.status(200).send(updatedObject);
};

// Update collection using $pull modifier
module.exports.updateCollectionPullFromArray = async ({
  Collection,
  filters,
  array,
  toBeRemoved,
  res,
}) => {
  // Validating if the given challenge exists & updating if ever it finds the challenge
  const updatedObject = await Collection.findOneAndUpdate(
    filters,
    {
      $pull: {
        [array]: toBeRemoved,
      },
    },
    { new: true }
  );

  if (!updatedObject) return res.status(400).send("Document not found !");
  res.status(200).send(updatedObject);
};

// Delete One document
module.exports.deleteDocument = async (Collection, id, res) => {
  const document = await Collection.findByIdAndRemove(id);
  res.status(200).send(document);
};
