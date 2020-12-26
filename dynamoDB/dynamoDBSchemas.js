const dynamoose = require("dynamoose");

const restaurantSchema = new dynamoose.Schema(
  {
    id: {
      hashKey: true,
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    name: String,
    description: String,
    reviews: Number,
    stars: {
      type: Object,
      schema: {
        general: Number,
        kitchen: Number,
        service: Number,
        quality: Number,
        general: Number,
      },
    },
    phone: String,
    address: String,
    email: String,
    city: String,
    website: String,
    kitchen: {
      type: Array,
      schema: [String],
    },
    priceRange: String,
    otherDiets: String,
    meals: {
      type: Array,
      schema: [String],
    },
    otherFunctions: {
      type: Array,
      schema: [String],
    },
    ratingDistribution: {
      type: Object,
      schema: {
        excellent: Number,
        verygood: Number,
        good: Number,
        fair: Number,
        poor: Number,
      },
    },
    crawled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new dynamoose.Schema(
  {
    id: {
      hashKey: true,
      type: String,
    },
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
      type: Object,
      schema: {
        excellent: Number,
        verygood: Number,
        good: Number,
        fair: Number,
        poor: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const reviewSchema = new dynamoose.Schema(
  {
    id: {
      hashKey: true,
      type: String,
      required: true,
    },
    restaurantId: String,
    stars: Number,
    title: String,
    text: String,
    reviewDate: Date,
    visitDate: Date,
    mobile: Boolean,
    thumbsUp: Number,
    userId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = {
  restaurantSchema,
  userSchema,
  reviewSchema,
};
