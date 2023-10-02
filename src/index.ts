// Import required modules
import express, { Request, Response } from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check for missing environment variables and throw an error if any are missing
if (
  !process.env.PRIVATE_KEY ||
  !process.env.CLIENT_EMAIL ||
  !process.env.PROJECT_ID
) {
  throw new Error("Environment variables are missing");
}

// Define the Firebase service account credentials
const serviceAccount = {
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: process.env.CLIENT_EMAIL,
  projectId: process.env.PROJECT_ID,
} as admin.ServiceAccount;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

// Initialize Express app
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Middleware for serving static files
app.use(express.static("public"));

// Get a reference to the Firestore database
const db = admin.firestore();

// Default port or port from .env file
const PORT = process.env.PORT ?? 3000;

// API root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, welcome to my API!");
});

/****ROUTES FOR HANDLING USERS****/

// Create a new user
app.post("/createUser", (req: Request, res: Response) => {
  (async () => {
    const { email, firstname, secondname, username, password } = req.body;

    if (!email || !firstname || !secondname || !username || !password) {
      res
        .status(400)
        .send(
          "All fields (email, firstname, secondname, username, password) are required."
        );
      return;
    }

    try {
      // Add the new user to the Firestore database
      const user = await db.collection("users").add({
        email,
        firstname,
        secondname,
        username,
        password, // TODO: Hash password before storing (handled in next steps)
      });

      res.status(201).send(`User created with ID: ${user.id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Get a user by ID
app.get("/getUser/:id", (req: Request, res: Response) => {
  (async () => {
    const { id } = req.params;
    try {
      const user = await db.collection("users").doc(id).get();
      if (!user.exists) {
        res.status(404).send("User not found");
        return;
      }
      res.status(200).send(user.data());
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Update a user by ID
app.put("/updateUser/:id", (req: Request, res: Response) => {
  (async () => {
    const { id } = req.params;
    const { name, age } = req.body;
    try {
      await db.collection("users").doc(id).update({ name, age });
      res.status(200).send("User updated successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Delete a user by ID
app.delete("/deleteUser/:id", (req: Request, res: Response) => {
  (async () => {
    const { id } = req.params;
    try {
      await db.collection("users").doc(id).delete();
      res.status(200).send("User deleted successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

/****ROUTES FOR HANDLING TEXTS****/

// Get all texts
app.get("/getAllTexts", (req: Request, res: Response) => {
  (async () => {
    try {
      const textsSnapshot = await db.collection("texts").get();
      const texts: any[] = [];

      textsSnapshot.forEach((doc) => {
        texts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      res.status(200).json(texts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Create a new text
app.post("/addText", (req: Request, res: Response) => {
  (async () => {
    const { content } = req.body;
    try {
      const text = await db.collection("texts").add({ content });
      res.status(201).send(`Text created with ID: ${text.id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Get a text by ID
app.get("/getText/:id", (req: Request, res: Response) => {
  (async () => {
    const { id } = req.params;
    try {
      const text = await db.collection("texts").doc(id).get();
      if (!text.exists) {
        res.status(404).send("Text not found");
        return;
      }
      res.status(200).send(text.data());
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Delete a text by ID
app.delete("/deleteText/:id", (req: Request, res: Response) => {
  (async () => {
    const { id } = req.params;
    try {
      await db.collection("texts").doc(id).delete();
      res.status(200).send("Text deleted successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  })();
});

// Start the server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
