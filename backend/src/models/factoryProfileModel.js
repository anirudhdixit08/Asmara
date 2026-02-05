const factoryProfileSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    factoryName: { type: String, required: true, trim: true },
    location: {
      address: String,
      city: String,
      country: { type: String, default: "India" },
    },
    capabilities: [String],
    dailyCapacity: Number,
    isVerified: { type: Boolean, default: false },
    phoneNumber: {
      type:[String],
      validate: [validator.isMobilePhone, "Invalid phone number"],
    },
  },
  { timestamps: true }
);

export const FactoryProfile = mongoose.model(
  "FactoryProfile",
  factoryProfileSchema
);
