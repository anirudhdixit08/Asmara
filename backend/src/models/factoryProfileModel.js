const factoryProfileSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    factoryName: { type: String, required: true, trim: true },
    location: {
      address: String,
      city: String,
      country: { type: String, default: "India" },
    },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FactoryProfile = mongoose.model(
  "FactoryProfile",
  factoryProfileSchema
);
