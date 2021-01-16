import mongoose from "mongoose";
import { Restaurant, Review, User } from "./mongoSchemas";

export const initDatabase = async (username, password) => {
  const uri = (username && password) ? `mongodb://${username}:${password}@mongodb:27017/tripadvisor?authSource=admin` : "mongodb://localhost:27017/tripadvisor?authSource=admin";
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  // Create or connect Data Models
  const RestaurantModel = mongoose.model("Restaurant", Restaurant);
  const UserModel = mongoose.model("User", User);
  const ReviewModel = mongoose.model("Review", Review);

  const handleError = (err) => err && console.log(err);

  // Restaurant handlers
  const insertManyRestaurants = (restaurants) =>
    RestaurantModel.insertMany(restaurants, handleError);
  const updateRestaurant = (id, restaurant) =>
    RestaurantModel.findByIdAndUpdate(id, restaurant, handleError);
  const getUncrawledRestaurant = () =>
    RestaurantModel.findOne({ crawled: false }).exec();
  const getAllUncrawledRestaurant = () =>
    RestaurantModel.find({ crawled: false }).exec();

  // User handlers
  const getUserFromUserId = (userId) =>
    UserModel.findOne({ userId: userId }).exec();
  const insertUser = async (user) => {
    const newUser = new UserModel(user);
    const createdUser = await newUser.save();
    return createdUser;
  };
  const updateUser = (id, user) => UserModel.findByIdAndUpdate(id, user).exec();

  // Review handlers
  const insertManyReviews = (reviews) => ReviewModel.insertMany(reviews);
  const getAllUncrawledReviews = () =>
    ReviewModel.find({ crawled: false }).exec();

  return {
    RestaurantModel,
    insertManyRestaurants,
    updateRestaurant,
    getUncrawledRestaurant,
    getAllUncrawledRestaurant,
    UserModel,
    getUserFromUserId,
    insertUser,
    updateUser,
    ReviewModel,
    insertManyReviews,
    getAllUncrawledReviews,
  };
};
