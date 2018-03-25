import fs from "fs";
import path from "path";

import expose from "./expose.js";
const { __dirname } = expose;

export const requireJSON = filepath => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, filepath), { encoding: "utf8" })
  );
};

export const filenameToContentType = filename => {
  const extension = filename
    .split(".")
    .pop()
    .toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
      break;
    default:
      return "image/" + extension;
      break;
  }
};

export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
