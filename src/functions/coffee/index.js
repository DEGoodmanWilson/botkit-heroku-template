require('dotenv').config();
const Firestore = require('@google-cloud/firestore');

// TODO: environment variables

const PROJECTID = process.env.PROJECTID;
const COLLECTION_NAME = process.env.COLLECTION;
const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true
});

exports.coffeeHTTP = (req, res) => {
  if (req.method === 'DELETE') throw 'not yet built';
  if (req.method === 'POST') {
    // store/insert a new document
    const data = req.body || {};
    const id = data.id || data.name.concat(data.roaster);
    const increment = Firestore.FieldValue.increment(1);

    if (data.likes) {
      return firestore
        .collection(COLLECTION_NAME)
        .doc(id)
        .update({ likes: increment })
        .then(doc => res.status(200).send(doc))
        .catch(err => res.status(404).send({ error: 'unable to store', err }));
    }
    if (data.dislikes) {
      return firestore
        .collection(COLLECTION_NAME)
        .doc(id)
        .update({ dislikes: increment })
        .then(doc => res.status(200).send(doc))
        .catch(err => res.status(404).send({ error: 'unable to store', err }));
    }

    return firestore
      .collection(COLLECTION_NAME)
      .doc(data.name.concat(data.roaster).replace(/ /g, ''))
      .set({
        // id: data.name.concat(data.roaster),
        name: data.name,
        roaster: data.roaster,
        brew: null,
        likes: 0,
        dislikes: 0
      })
      .then(doc => res.status(200).send(doc))
      .catch(err => res.status(404).send({ error: 'unable to store', err }));
  }
  if (req.method === 'GET') {
    // read/retrieve an existing document by id
    if (!(req.query && req.query.id)) {
      return res.status(404).send({ error: 'No Id' });
    }
    const id = req.query.id.replace(/[^a-zA-Z0-9]/g, '').trim();
    if (!(id && id.length)) {
      return res.status(404).send({ error: 'Empty Id' });
    }
    return firestore
      .collection(COLLECTION_NAME)
      .doc(id)
      .then(doc => {
        if (!(doc && doc.exists)) {
          return res.status(404).send({ error: 'Unable to find the document' });
        }
        return res.status(200).send(doc.data());
      })
      .catch(err => res.status(404).send({ error: err }));
  }
};
