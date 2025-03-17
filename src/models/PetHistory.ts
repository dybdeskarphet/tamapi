import mongoose, { Document, Schema } from "mongoose";

const IDENTIFIER: string = "model(PetHistory)";

interface IPetHistory extends Document {
  timestamp: Date;
  action: string;
  linkedTo: mongoose.Types.ObjectId;
}

const PetHistorySchema = new mongoose.Schema<IPetHistory>({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Pet",
  },
});

const PetHistory = mongoose.model("PetHistory", PetHistorySchema);

export { PetHistory, IPetHistory };
