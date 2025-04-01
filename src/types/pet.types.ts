import mongoose, { Document } from "mongoose";

export namespace PetTypes {
  export enum PetForm {
    Cat = "Cat",
    Dog = "Dog",
    Rabbit = "Rabbit",
    Wolf = "Wolf",
    Alien = "Alien",
  }

  export type PetFields<K extends "patchableKeys" | "statusKeys"> =
    K extends "patchableKeys"
      ? Partial<Record<PetTypes.patchableKeys, unknown>>
      : Partial<Record<PetTypes.statusKeys, number>>;

  export interface IPet extends Document {
    name: string;
    type: PetForm;
    age: number;
    health: number;
    happiness: number;
    hunger: number;
    energy: number;
    hygiene: number;
    owner: mongoose.Types.ObjectId;
    history: mongoose.Types.ObjectId[];
    value: any;
    fieldName: string;
    isGivenCategory(category: string, fieldName: string): Promise<boolean>;
    isValidFieldType(value: any, fieldName: string): Promise<boolean>;
  }

  export type statusKeys = keyof Pick<
    IPet,
    "health" | "happiness" | "hunger" | "energy" | "hygiene"
  >;

  export type patchableKeys = keyof Pick<IPet, "name">;

  export interface IPetHistory extends Document {
    timestamp: Date;
    action: string;
    linkedTo: mongoose.Types.ObjectId;
  }
}
