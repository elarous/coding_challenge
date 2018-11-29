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
      preferredStores: [String],
      dislikedStores: [{ store: String, timestamp: Date }]
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

  loadUser(email, password = null) {}

  nearShops({ lat, long }) {}

  addShopToPreferred(user, shop) {}

  removeShopFromPreferred(user, shop) {}

  addToDisliked(user, shop) {}

  getPreffered(user) {}
}

export default Store;
