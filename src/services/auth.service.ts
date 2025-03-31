import { ServiceError } from "../errors/service.error";
import { User } from "../models/user.model";
import { UserTypes } from "../types/user.types";
import validator from "validator";
import { checkUserExistence } from "../utils/user.utils";
import { isUserNameValid } from "../utils/user.utils";

const postAuthRegisterService = async (
  email: string,
  name: string,
  username: string,
  password: string,
): Promise<Partial<UserTypes.IUser>> => {
  if (
    !validator.isEmail(email, {
      allow_underscores: true,
      allow_ip_domain: true,
    })
  ) {
    throw new ServiceError(400, "Bad e-mail address.");
  }

  if (!validator.isStrongPassword(password)) {
    throw new ServiceError(400, "Bad password.");
  }

  if (
    !(username.length > 3) ||
    !(username.length < 30) ||
    !isUserNameValid(username)
  ) {
    throw new ServiceError(400, "Bad username.");
  }

  if (!(name.length > 1) || !(name.length < 150)) {
    throw new ServiceError(400, "This name is very long to save.");
  }

  await checkUserExistence({ username });
  await checkUserExistence({ email });

  const user = new User({ email, name, username, password });
  await user.save();

  return {
    email: user.email,
    name: user.name,
    username: user.username,
  };
};

export { postAuthRegisterService };
