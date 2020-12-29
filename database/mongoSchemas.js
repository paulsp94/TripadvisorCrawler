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
    name: String,
    description: String,
    reviews: Number,
    stars: {
      general: Number,
      kitchen: Number,
      service: Number,
      quality: Number,
      general: Number,
    },
    phone: String,
    address: String,
    email: String,
    city: String,
    zipCode: String,
    website: String,
    kitchen: [String],
    priceRange: String,
    otherDiets: String,
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
  },
  { timestamps: true }
);

export const User = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ratings: Number,
    thumbsUp: Number,
    visitedTowns: Number,
    images: Number,
    level: Number,
    memberSince: Date,
    homeTown: String,
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
    restaurantId: { type: ObjectId, ref: "Restaurant" },
    stars: Number,
    title: String,
    text: String,
    reviewDate: Date,
    visitDate: Date,
    mobile: Boolean,
    thumbsUp: Number,
    postedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);