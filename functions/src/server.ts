import express, { Request, Response } from "express";
import * as admin from "firebase-admin";
import createTextRoutes from "./textRoutes";
import createUserRoutes from "./userRoutes";
import * as functions from "firebase-functions";
import cors from "cors";

const serviceAccount = {
  privateKey: functions.config().admin.private_key.replace(/\\n/g, "\n"),
  clientEmail: functions.config().admin.client_email,
  projectId: functions.config().admin.project_id,
} as admin.ServiceAccount;

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://text-hub-api.firebaseio.com",
});
console.log(functions.config().admin);
const db = admin.firestore();

// Initialize Express app
const app = express();
const corsOptions = {
  origin: ["https://www.fastype.desem.dev", "https://fastype.desem.dev"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware for parsing JSON
app.use(express.json({ limit: "1mb" }));

// Middleware for serving static files
app.use(express.static("public"));

// API root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, welcome to my API!");
});

// Utilisation des routes et des middlewares
app.use("/user", createUserRoutes(db));
app.use("/texte", createTextRoutes(db));

export default app;
