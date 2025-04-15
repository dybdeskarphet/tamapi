import { Request, Response } from "express";
import path from "path";
import fs from "fs";

const rootController = (req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../../public/index.html");

  // Read the HTML file and send it as a response
  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      res.status(500).send("Error loading homepage.");
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(htmlData);
  });
};

export { rootController };
