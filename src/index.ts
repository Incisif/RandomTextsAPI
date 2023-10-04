// Import required modules
import express, { Request, Response } from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import createTextRoutes from "./textRoutes";
import createUserRoutes from "./userRoutes";


// Load environment variables from .env file
dotenv.config();

const serviceAccount = {
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.CLIENT_EMAIL,
  projectId: process.env.PROJECT_ID,
} as admin.ServiceAccount;
console.log(process.env.PRIVATE_KEY, process.env.CLIENT_EMAIL, process.env.PROJECT_ID);
// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();

// Initialize Express app
const app = express();
const cors = require("cors");
app.use(cors());
// Middleware for parsing JSON
app.use(express.json({ limit: "1mb" }));

// Middleware for serving static files
app.use(express.static("public"));

// API root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, welcome to my API!");
});

// Utilisation des routes et des middlewares
app.use("/user",  createUserRoutes(db));
app.use("/texte",  createTextRoutes(db));

// Default port or port from .env file
const PORT = process.env.PORT ?? 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
