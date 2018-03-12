import fs from "fs";
import path from "path";

import expose from "./expose.js";
const { __dirname } = expose;

export const requireJSON = filepath => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, filepath), { encoding: "utf8" })
  );
};
