/* eslint-disable no-underscore-dangle */
import mongoose, { mongo } from 'mongoose';
import { ObjectId } from 'mongodb';

let storeTest;
let storeProd;

class Store {
  constructor(dbUrl = 'mongodb://localhost/ccdb') {
    // connect to mongo
    mongoose.connect(dbUrl);
    this.mdb = mongoose.connection;
    this.mdb.on('error', console.error.bind(console, 'connection error:'));
    this.mdb.once('open', () => console.log('Connected to DB'));

    /* Schemas */
    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      password: String,
      preferredShops: [String],
      dislikedShops: [{ shop: String, timestamp: Date }]
    });

    const shopSchema = new mongoose.Schema({
      name: { type: String, unique: true },
      image: String,
      location: {
        type: { type: String },
        coordinates: []
      }
    });
    // index for the geo json queries
    shopSchema.index({ location: '2dsphere' });

    // create models
    this.User = mongoose.model('User', userSchema);
    this.Shop = mongoose.model('Shop', shopSchema);
  }

  // exposing this three references for testing
  get db() {
    return this.mdb;
  }

  get userModel() {
    return this.User;
  }

  get shopModel() {
    return this.Shop;
  }

  // add a user to db
  saveUser(email, password) {
    return this.User({ email, password }).save();
  }

  // find a user by email (to check if a user with that email already exists)
  // or by the email and password pair (to authenticate user)
  loadUser(email, password = null) {
    if (password) {
      return this.User.findOne({ email, password });
    }
    return this.User.findOne({ email });
  }

  // add a shop to db
  saveShop(name, image, { lat, long }) {
    return this.Shop({
      name,
      image,
      location: { type: 'Point', coordinates: [long, lat] }
    }).save();
  }

  // find shop by id
  getShopById(id) {
    return this.Shop.findById(id);
  }

  // add a shop to the user's list of preferred shops
  addToPreferred(userId, shopId) {
    return this.User.findByIdAndUpdate(
      userId,
      { $push: { preferredShops: shopId } },
      { new: true, upsert: true }
    ).exec();
  }

  // get prefered shops of a user
  loadPreferredShops(userId) {
    return new Promise((resolve, reject) => {
      this.User.findById(userId)
        .exec()
        .then((user) => {
          this.Shop.find({ _id: { $in: user.preferredShops } })
            .exec()
            .then(shops => resolve(shops))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  // remove a shop from the user's preferred list
  removeFromPreferred(userId, shopId) {
    return this.User.findByIdAndUpdate(
      userId,
      { $pull: { preferredShops: shopId } },
      { new: true, upsert: true }
    ).exec();
  }

  // when a user dislikes a shop
  addToDisliked(userId, shopId, timestamp = new Date()) {
    return this.User.findByIdAndUpdate(
      userId,
      {
        $push: {
          dislikedShops: {
            shop: shopId,
            timestamp
          }
        }
      },
      { new: true, upsert: true }
    ).exec();
  }

  // get near shops to the given point
  nearShops({ lat, long }) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('shops')
        .find({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [long, lat] }
            }
          }
        })
        .toArray((err, docs) => {
          if (err) {
            reject(err);
          }
          resolve(docs);
        });
    });
  }

  // return true if `shop` was disliked for more than 2 hours ago
  static dislikedAbove2Hours(dislikedShops, shop) {
    const dislikeInfos = dislikedShops.filter(ds => new ObjectId(ds.shop).equals(shop._id))[0];
    const twoHours = 2 * 60 * 60 * 1000;

    // should probably get time as utc
    return +Date.now() - +dislikeInfos.timestamp >= twoHours;
  }

  static shopWithin(idsStr, shopId) {
    const ids = idsStr.map(id => new ObjectId(id));
    return ids.some(id => id.equals(shopId));
  }

  filterOut(userId, shops, predicate) {
    return new Promise((resolve, reject) => {
      this.User.findById(userId)
        .exec()
        .then((user) => {
          const filteredShops = shops.filter(shop => predicate(user, shop));
          resolve(filteredShops);
        })
        .catch(err => reject(err));
    });
  }

  filterOutDisliked(userId, shops) {
    return this.filterOut(
      userId,
      shops,
      (user, shop) => !Store.shopWithin(user.dislikedShops.map(sObj => sObj.shop), shop._id)
        || Store.dislikedAbove2Hours(user.dislikedShops, shop)
    );
  }

  filterOutPreferred(userId, shops) {
    return this.filterOut(
      userId,
      shops,
      (user, shop) => !Store.shopWithin(user.preferredShops, shop._id)
    );
  }
}

// a function to make Store a singleton
function getStore(type = 'test') {
  if (type === 'test') {
    if (storeTest) {
      return storeTest;
    }
    storeTest = new Store(process.env.DB_TEST);
    return storeTest;
  }
  if (type === 'prod') {
    if (storeProd) {
      return storeProd;
    }
    storeProd = new Store(process.env.DB_PROD);
    return storeProd;
  }
  return null;
}

export default getStore;
