import mongoose from 'mongoose';

class Store {
  constructor(dbUrl) {
    mongoose.connect(dbUrl);
    this.mdb = mongoose.connection;

    this.mdb.on('error', console.error.bind(console, 'connection error:'));
    this.mdb.once('open', () => console.log('Connected to DB'));

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

    shopSchema.index({ location: '2dsphere' });

    this.User = mongoose.model('User', userSchema);
    this.Shop = mongoose.model('Shop', shopSchema);
  }

  get db() {
    return this.mdb;
  }

  get userModel() {
    return this.User;
  }

  get shopModel() {
    return this.Shop;
  }

  saveUser(email, password) {
    return this.User({ email, password }).save();
  }

  loadUser(email, password = null) {
    if (password) {
      return this.User.findOne({ email, password });
    }
    return this.User.findOne({ email });
  }

  saveShop(name, image, { lat, long }) {
    return this.Shop({
      name,
      image,
      location: { type: 'Point', coordinates: [long, lat] }
    }).save();
  }

  getShopById(id) {
    return this.Shop.findById(id);
  }

  addToPreferred(userId, shopId) {
    return this.User.findByIdAndUpdate(
      userId,
      { $push: { preferredShops: shopId } },
      { new: true, upsert: true }
    ).exec();
  }

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

  removeFromPreferred(userId, shopId) {
    return this.User.findByIdAndUpdate(
      userId,
      { $pull: { preferredShops: shopId } },
      { new: true, upsert: true }
    ).exec();
  }

  addToDisliked(userId, shopId) {
    return this.User.findByIdAndUpdate(
      userId,
      {
        $push:
        {
          dislikedShops:
          {
            shop: shopId,
            timestamp: new Date()
          }
        }
      },
      { new: true, upsert: true }
    ).exec();
  }

  nearShops({ lat, long }) {
    return new Promise((resolve, reject) => {
      this.db.collection('shops').find(
        {
          location:
            {
              $near:
                {
                  $geometry: { type: 'Point', coordinates: [long, lat] }
                }
            }
        }
      ).toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
    });
  }
}

export default Store;
