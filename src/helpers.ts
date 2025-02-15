import path from "path";

const err = (context: String, message: String) => {
  console.error(`\x1b[1;31m${context}: \x1b[0m${message}`);
};

const log = (context: String, message: String) => {
  console.log(`\x1b[1;32m${context}: \x1b[0m${message}`);
};

export { err, log };
