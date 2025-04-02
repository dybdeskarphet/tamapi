import { ServiceError } from "../errors/service.error";
import { User } from "../models/user.model";
import { UserTypes } from "../types/user.types";
import validator from "validator";
import { checkUserExistence, getUser } from "../utils/user.utils";
import { isUserNameValid } from "../utils/user.utils";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";

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
    throw new ServiceError(
      400,
      "Bad e-mail address. Your e-mail address should look like 'test@test.com' or 'test@127.0.0.1'.",
    );
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
    throw new ServiceError(
      400,
      "This name is either too short or too long to be saved. It should be between 1 and 150 characters.",
    );
  }

  await checkUserExistence({ username }, true);
  await checkUserExistence({ email }, true);

  const user = new User({ email, name, username, password });
  await user.save();

  return {
    email: user.email,
    name: user.name,
    username: user.username,
  };
};

const postAuthLoginService = async (
  email: string,
  password: string,
  tokenDuration: StringValue,
) => {
  const user = (await getUser({ email }, true)) as UserTypes.IUser;
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ServiceError(401, "Invalid credentials.");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: tokenDuration,
    },
  );

  return token;
};

export { postAuthRegisterService, postAuthLoginService };
