const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./src/routes/auth");
const recipeRoutes = require("./src/routes/recipes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  bodyParser.json(),
  cors({
    origin: ["https://firebook.app", "https://www.firebook.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.set("trust proxy", 1);

// Mount routes
app.use("/", authRoutes); // Auth routes: /signup, /login, /me
app.use("/", recipeRoutes); // Recipe routes: /save-recipe, /random-recipes, etc.

// APK download route
app.get("/firebook_alpha", (req, res) => {
  const apkPath = path.join(__dirname, "public", "firebook_alpha.apk");
  res.download(apkPath, "firebook_alpha.apk", (err) => {
    if (err) {
      console.error("Error while downloading APK:", err);
      res.status(500).send("Could not download the APK.");
    }
  });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
