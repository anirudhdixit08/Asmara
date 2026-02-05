const asmaraProfileSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, default: "Asmara Group" },
    department: String,
    assignedFactories: [{ type: Schema.Types.ObjectId, ref: "FactoryProfile" }],
    phoneNumber: {
      type: String,
      validate: [validator.isMobilePhone, "Invalid phone number"],
    },
  },
  { timestamps: true }
);

export const AsmaraProfile = mongoose.model(
  "AsmaraProfile",
  asmaraProfileSchema
);
