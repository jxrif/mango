import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

app.use(bodyParser.json());

let passwords = [];

// Endpoint to store the generated password
app.post("/set-password", (req, res) => {
  const password = req.body.password;
  const timestamp = new Date().toISOString();

  passwords.push({ password, timestamp });
  const formattedTimestamp = new Date(timestamp).toLocaleString("en-GB", {
    timeZone: "UTC",
    hour12: false,
  });
  console.log(chalk.green(`pwd created: ${password} | ${formattedTimestamp}`));
  res.send({ status: "Password set" });

  // Remove password after 3 minutes if it hasn't been used
  setTimeout(() => {
    const passwordIndex = passwords.findIndex((p) => p.password === password);
    if (passwordIndex !== -1) {
      passwords.splice(passwordIndex, 1);
      const formattedExpiration = new Date().toLocaleString("en-GB", {
        timeZone: "UTC",
        hour12: false,
      });
      console.log(
        chalk.red(
          `pwd expired: ${password} | ${formattedExpiration} (after: 3 minutes)`
        )
      );
    }
  }, 3 * 60 * 1000); // 3 minutes in milliseconds
});

// Endpoint to get the current passwords
app.get("/get-passwords", (req, res) => {
  res.send({ passwords });
});

// Endpoint to delete a specific password or all passwords
app.post("/delete-password", (req, res) => {
  const { password } = req.body;
  const now = new Date().toLocaleString("en-GB", {
    timeZone: "UTC",
    hour12: false,
  });

  if (password === "all") {
    passwords = [];
    console.log(chalk.red(`all passwords deleted | ${now}`));
    res.send({ status: "All passwords deleted" });
  } else {
    const passwordIndex = passwords.findIndex((p) => p.password === password);
    if (passwordIndex !== -1) {
      passwords.splice(passwordIndex, 1);
      console.log(chalk.red(`pwd deleted: ${password} | ${now}`));
      res.send({ status: "Password deleted" });
    } else {
      res.status(404).send({ status: `Password "${password}" does not exist` });
    }
  }
});

// Serve the HTML page to display the current passwords
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});