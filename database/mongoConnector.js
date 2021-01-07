import mongoose from "mongoose";
import { Restaurant, Review, User } from "./mongoSchemas";

export const initDatabase = async () => {
  await mongoose.connect("mongodb://localhost:27017/tripadvisor", {
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
    RestaurantModel.findByIdAndUpdate(id, restaurant);
  const getUncrawledRestaurant = () =>
    RestaurantModel.findOne({ crawled: false });
  const getAllUncrawledRestaurant = () =>
    RestaurantModel.find({ crawled: false });

  // User handlers
  const getUserFromUserId = (userId) => UserModel.findOne({ userId: userId });
  const insertUser = (user) => UserModel.insert(user);
  const updateUser = (id, user) => UserModel.findByIdAndUpdate(id, user);

  // Review handlers
  const insertManyReviews = (reviews) =>
    ReviewModel.insertMany(reviews, handleError);

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
  };
};
