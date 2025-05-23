import mongoose from "mongoose";
import { ServiceError } from "../errors/service.error";
import { err } from "../helpers";
import { User } from "../models/user.model";
import { UserTypes } from "../types/user.types";

export async function validateQuery({
  _id,
  username,
  email,
}: Partial<UserTypes.UserQuery>) {
  let query: UserTypes.UserQuery = {};

  if (username) {
    if (typeof username === "string") {
      query.username = username;
    } else {
      throw new ServiceError(400, "Invalid username format.");
    }
  }

  if (email) {
    if (typeof email === "string") {
      query.email = email;
    } else {
      throw new ServiceError(400, "Invalid e-mail format.");
    }
  }

  if (_id) {
    if (typeof _id === "string" && mongoose.isValidObjectId(_id)) {
      query._id = _id;
    } else {
      throw new ServiceError(400, "Invalid user ID format.");
    }
  }

  if (Object.keys(query).length === 0) {
    err(
      "user.utils.ts",
      "You should give at least one argument to the validateQuery function.",
    );
    throw new ServiceError(400, "Invalid format.");
  }

  return query;
}

export async function checkUserExistence(
  { _id, username, email }: Partial<UserTypes.UserQuery>,
  errorIfExist: boolean,
) {
  let query: UserTypes.UserQuery = await validateQuery({
    _id,
    username,
    email,
  });
  const user = await User.findOne(query).exec();

  if (user) {
    if (errorIfExist) {
      throw new ServiceError(409, `User already exist.`, {
        query: Object.values(query),
      });
    }
  } else {
    if (!errorIfExist) {
      throw new ServiceError(409, "User doesn't exist.", {
        query: Object.values(query),
      });
    }
  }
}

export async function getUser(
  { _id, username, email }: Partial<UserTypes.UserQuery>,
  password: boolean,
  validate: boolean = true,
  populate: string[] = ["pets"],
) {
  let query: UserTypes.UserQuery = await validateQuery({
    _id,
    username,
    email,
  });

  let passwordString = password ? "+password" : "-password";

  const user = await User.findOne(query)
    .select(passwordString)
    .populate(populate.join(" "))
    .exec();
  if (user) {
    return user;
  } else {
    if (validate) {
      throw new ServiceError(404, `Couldn't find the user.`);
    } else {
      return {};
    }
  }
}

export const isUserNameValid = (username: string) => {
  const res = /^[a-z0-9_\.]+$/.exec(username);
  const valid = !!res;
  return valid;
};
