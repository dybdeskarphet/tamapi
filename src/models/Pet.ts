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

type PetTypeEnum = `${PetType}`;

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
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(PetType), required: true },
  age: { type: Number, required: true },
  health: { type: Number, required: true },
  happiness: { type: Number, required: true },
  hunger: { type: Number, required: true },
  energy: { type: Number, required: true },
  hygiene: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
