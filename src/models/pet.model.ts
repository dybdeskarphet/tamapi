import mongoose, { Document, Schema } from "mongoose";
import { PetTypes } from "../types/pet.types";

const IDENTIFIER: string = "model(Pet)";

const PetSchema = new mongoose.Schema<PetTypes.IPet>({
  name: {
    type: String,
    required: true,
    minlength: [1, "Pet must have a name"],
    category: "patchable",
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
    category: "status",
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
    category: "status",
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
    category: "status",
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
    category: "status",
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
    category: "status",
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "PetHistory" }],
});

PetSchema.methods.isGivenCategory = async function (
  category: string,
  fieldName: string,
): Promise<boolean> {
  const schemaField = this.schema.path(fieldName);
  return schemaField && schemaField.options.category === category;
};

PetSchema.methods.isValidFieldType = async function (
  value: any,
  fieldName: string,
): Promise<boolean> {
  const schemaField = this.schema.path(fieldName);
  if (!schemaField) return false;
  const expectedType = schemaField.instance.toLowerCase();

  const typeCheckers: Record<string, (val: any) => boolean> = {
    number: (val) => typeof val === "number" && !isNaN(val),
    string: (val) => typeof val === "string",
    boolean: (val) => typeof val === "boolean",
    objectid: (val) => mongoose.Types.ObjectId.isValid(val),
    date: (val) => val instanceof Date || !isNaN(Date.parse(val)),
    array: (val) => Array.isArray(val),
  };

  return typeCheckers[expectedType] ? typeCheckers[expectedType](value) : false;
};

const Pet = mongoose.model("Pet", PetSchema);

export { Pet };
