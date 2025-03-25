import mongoose, { Document, Schema } from "mongoose";
import { PetTypes } from "../types/petTypes";

const IDENTIFIER: string = "model(Pet)";

const PetSchema = new mongoose.Schema<PetTypes.IPet>({
  name: {
    type: String,
    required: true,
    minlength: [1, "Pet must have a name"],
  },
  type: {
    type: String,
    enum: Object.values(PetTypes.PetForm),
    required: true,
  },
  age: {
    type: Number,
    default: 1,
    min: [1, "Age must be at least 1"],
    set: (v: any) => {
      if (typeof v !== "number" || isNaN(v)) return undefined;
      return Math.max(1, v);
    },
  },
  health: {
    type: Number,
    default: 100,
    min: [0, "Health must be at least 0"],
    max: [100, "Health must be lower than 100"],
    set: (v: any) => {
      if (typeof v !== "number" || isNaN(v)) return undefined;
      return Math.min(100, Math.max(0, v));
    },
  },
  happiness: {
    type: Number,
    default: 100,
    min: [0, "Happiness must be at least 0"],
    max: [100, "Happiness must be lower than 100"],
    set: (v: any) => {
      if (typeof v !== "number" || isNaN(v)) return undefined;
      return Math.min(100, Math.max(0, v));
    },
  },
  hunger: {
    type: Number,
    default: 100,
    min: [0, "Hunger must be at least 0"],
    max: [100, "Hunger must be lower than 100"],
    set: (v: any) => {
      if (typeof v !== "number" || isNaN(v)) return undefined;
      return Math.min(100, Math.max(0, v));
    },
  },
  energy: {
    type: Number,
    default: 100,
    min: [0, "Energy must be at least 0"],
    max: [100, "Energy must be lower than 100"],
    set: (v: any) => {
      if (typeof v !== "number" || isNaN(v)) return undefined;
      return Math.min(100, Math.max(0, v));
    },
  },
  hygiene: {
    type: Number,
    default: 100,
    min: [0, "Hygiene must be at least 0"],
    max: [100, "Hygiene must be lower than 100"],
    set: (v: any) => {
      if (typeof v !== "number" || isNaN(v)) return undefined;
      return Math.min(100, Math.max(0, v));
    },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "PetHistory" }],
});

const Pet = mongoose.model("Pet", PetSchema);

export { Pet };
