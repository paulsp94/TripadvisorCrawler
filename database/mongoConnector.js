import mongoose from "mongoose";
import { Restaurant, Review, User } from "./mongoSchemas";

export const initDatabase = async () => {
  await mongoose.connect("mongodb://localhost:27017/tripadvisor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  const RestaurantModal = mongoose.model("Restaurant", Restaurant);
  const UserModal = mongoose.model("User", User);
  const ReviewModal = mongoose.model("Review", Review);

  const insertManyRestaurants = (restaurants) =>
    RestaurantModal.insertMany(restaurants, (err) => err && console.log(err));

  return { RestaurantModal, UserModal, ReviewModal, insertManyRestaurants };
};
