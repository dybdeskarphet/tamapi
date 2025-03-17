import mongoose, { Document, Schema } from "mongoose";
import { err } from "../helpers";

const IDENTIFIER: string = "model(Pet)";

enum PetType {
  Cat = "Cat",
  Dog = "Dog",
  Rabbit = "Rabbit",
  Wolf = "Wolf",
  Alien = "Alien",
}

interface IPet extends Document {
  name: string;
  type: PetType;
  age: number;
  health: number;
  happiness: number;
  hunger: number;
  energy: number;
  hygiene: number;
  owner: mongoose.Types.ObjectId;
  history: mongoose.Types.ObjectId[];
}

const PetSchema = new mongoose.Schema<IPet>({
  name: {
    type: String,
    required: true,
    minlength: [1, "Pet must have a name"],
  },
  type: {
    type: String,
    enum: Object.values(PetType),
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
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "History" }],
});

// NOTE: I fucking hate this part, it doesn't even work for updates
PetSchema.pre("save", async function (next) {
  try {
    const pet = this as IPet;

    // WARN: This is a workaround and I want to fix this type issue using a dynamic aprroach
    // For now, please just add the fields that you want to clamp both to the array and the type definition.
    type fieldsToClampType = (keyof Pick<
      IPet,
      "health" | "happiness" | "hunger" | "energy" | "hygiene"
    >)[];

    const fieldsToClamp: fieldsToClampType = [
      "health",
      "happiness",
      "hunger",
      "energy",
      "hygiene",
    ];

    for (const field of fieldsToClamp) {
      if (pet.isModified(field))
        pet[field] = Math.min(100, Math.max(0, pet[field]));
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Pet = mongoose.model("Pet", PetSchema);
export { Pet, IPet };
