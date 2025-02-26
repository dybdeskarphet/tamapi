import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { err } from "../helpers";

const IDENTIFIER: string = "model(User)";

interface IUser extends Document {
  email: string;
  name: string;
  username: string;
  password: string;
  pets: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: false },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
});

UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!this.isModified("password")) return next();

  try {
    // NOTE: Salt creates an extra layer of security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export { User, IUser };
