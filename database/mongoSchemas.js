import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

export const Restaurant = new Schema(
  {
    url: {
      type: String,
      required: true,
      index: true,
    },
    restaurantId: String,
    name: String,
    description: String,
    reviews: Number,
    stars: {
      general: Number,
      kitchen: Number,
      service: Number,
      quality: Number,
      furnishing: Number,
    },
    phone: String,
    address: String,
    email: String,
    city: String,
    zipCode: String,
    website: String,
    kitchen: [String],
    priceLevel: String,
    priceRange: String,
    otherDiets: [String],
    meals: [String],
    otherFunctions: [String],
    ratingDistribution: {
      excellent: Number,
      verygood: Number,
      good: Number,
      fair: Number,
      poor: Number,
    },
    crawled: {
      type: Boolean,
      default: false,
    },
    crawledReviews: {
      type: Boolean,
      defaul: false,
    },
  },
  { timestamps: true }
);

export const User = new Schema(
  {
    name: String,
    userId: {
      type: String,
      required: true,
      index: true,
    },
    ratings: Number,
    thumbsUp: Number,
    visitedTowns: Number,
    images: Number,
    level: Number,
    memberSince: Date,
    homeTown: String,
    age: String,
    sex: String,
    ratingDistribution: {
      excellent: Number,
      verygood: Number,
      good: Number,
      fair: Number,
      poor: Number,
    },
    crawled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Review = new Schema(
  {
    restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
    url: {
      type: String,
      required: true,
      index: true,
    },
    reviewId: String,
    stars: Number,
    title: String,
    text: String,
    language: String,
    reviewDate: Date,
    visitDate: Date,
    mobile: Boolean,
    thumbsUp: Number,
    crawled: {
      type: Boolean,
      default: false,
    },
    postedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);
