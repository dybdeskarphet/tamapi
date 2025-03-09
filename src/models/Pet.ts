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
    required: true,
    default: 1,
    min: [1, "Age must be at least 1"],
  },
  health: {
    type: Number,
    required: true,
    default: 100,
    min: [0, "Health must be at least 0"],
    max: [100, "Health must be lower than 100"],
  },
  happiness: {
    type: Number,
    required: true,
    default: 100,
    min: [0, "Happiness must be at least 0"],
    max: [100, "Happiness must be lower than 100"],
  },
  hunger: {
    type: Number,
    required: true,
    default: 100,
    min: [0, "Hunger must be at least 0"],
    max: [100, "Hunger must be lower than 100"],
  },
  energy: {
    type: Number,
    required: true,
    default: 100,
    min: [0, "Energy must be at least 0"],
    max: [100, "Energy must be lower than 100"],
  },
  hygiene: {
    type: Number,
    required: true,
    default: 100,
    min: [0, "Hygiene must be at least 0"],
    max: [100, "Hygiene must be lower than 100"],
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Pet = mongoose.model("Pet", PetSchema);
export { Pet, IPet };
