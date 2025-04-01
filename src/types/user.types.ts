import mongoose, { Document } from "mongoose";

export namespace UserTypes {
  export interface IUser extends Document {
    email: string;
    name: string;
    username: string;
    password: string;
    pets: mongoose.Types.ObjectId[];
    comparePassword(candidatePassword: string): Promise<boolean>;
  }
  export interface UserQuery {
    _id?: string;
    username?: string;
    email?: string;
  }
}
