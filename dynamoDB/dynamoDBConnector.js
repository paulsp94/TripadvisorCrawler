require("dotenv").config();
const dynamoose = require("dynamoose");
const {
  restaurantSchema,
  reviewSchema,
  userSchema,
} = require("./dynamoDBSchemas");

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

dynamoose.aws.sdk.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

dynamoose.model.defaults.set({
  prefix: "MasterThesis_",
});

const Restaurants = dynamoose.model("Restaurant", restaurantSchema);
const Review = dynamoose.model("Review", reviewSchema);
const User = dynamoose.model("User", userSchema);

exports.createRestaurant = async (restaurantObject) => {
  try {
    const restaurant = await Restaurants.create(restaurantObject);
    console.log(restaurant);
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.batchCreateRestaurant = async (restaurantsList) => {
  try {
    const restaurants = await Restaurants.batchPut(restaurantsList);
    console.log(restaurants);
    if (restaurants.unprocessedItems.length) {
      return restaurants.unprocessedItems;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};
