import mongoose, { Document, Schema } from "mongoose";
import { PetTypes } from "../types/pet.types";

const IDENTIFIER: string = "model(PetHistory)";

const PetHistorySchema = new mongoose.Schema<PetTypes.IPetHistory>({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Pet",
  },
});

const PetHistory = mongoose.model("PetHistory", PetHistorySchema);

export { PetHistory };
