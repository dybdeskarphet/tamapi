import mongoose from "mongoose";

export namespace PetTypes {
  export enum PetForm {
    Cat = "Cat",
    Dog = "Dog",
    Rabbit = "Rabbit",
    Wolf = "Wolf",
    Alien = "Alien",
  }

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
  }

  export type statusKeys = keyof Pick<
    IPet,
    "health" | "happiness" | "hunger" | "energy" | "hygiene"
  >;

  export interface IPetHistory extends Document {
    timestamp: Date;
    action: string;
    linkedTo: mongoose.Types.ObjectId;
  }
}
