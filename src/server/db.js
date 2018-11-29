import mongoose from 'mongoose';

class Store {
  constructor() {
    mongoose.connect('mongodb://localhost/ccdb');
    this.db = mongoose.connection;

    this.db.on('error', console.error.bind(console, 'connection error:'));
    this.db.once('open', () => console.log('Connected to DB'));

    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      preferredShops: [String],
      dislikedShops: [{ shop: String, timestamp: Date }]
    });

    const shopSchema = new mongoose.Schema({
      name: String,
      image: String,
      coords: { lat: Number, long: Number }
    });

    this.User = mongoose.model('User', userSchema);
    this.Shop = mongoose.model('Shop', shopSchema);
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

  saveShop(name, image, coords) {
    return this.Shop({ name, image, coords }).save();
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

  nearShops({ lat, long }) {}

  removeShopFromPreferred(user, shop) {}

  addToDisliked(user, shop) {}

  getPreffered(user) {}
}

export default Store;
