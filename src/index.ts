// Import required modules
import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check for missing environment variables and throw an error if any are missing
if (!process.env.PRIVATE_KEY || !process.env.CLIENT_EMAIL || !process.env.PROJECT_ID || !process.env.DATABASE_URL) {
    throw new Error('Environment variables are missing');
}

// Define the Firebase service account credentials
const serviceAccount = {
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL,
    projectId: process.env.PROJECT_ID,
} as admin.ServiceAccount;

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
});

// Initialize Express app
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Get a reference to the Firestore database
const db = admin.firestore();

// Default port or port from .env file
const PORT = process.env.PORT ?? 3000;

// API root endpoint
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, welcome to my API!');
});

// Create a new user
app.post('/createUser', (req: Request, res: Response) => {
    (async () => {
        const { name, age } = req.body;
        try {
            const user = await db.collection('users').add({ name, age });
            res.status(201).send(`User created with ID: ${user.id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send('An unknown error occurred');
            }
        }
    })();
});

// Get a user by ID
app.get('/getUser/:id', (req: Request, res: Response) => {
    (async () => {
        const { id } = req.params;
        try {
            const user = await db.collection('users').doc(id).get();
            if (!user.exists) {
                res.status(404).send('User not found');
                return;
            }
            res.status(200).send(user.data());
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send('An unknown error occurred');
            }
        }
    })();
});

// Update a user by ID
app.put('/updateUser/:id', (req: Request, res: Response) => {
    (async () => {
        const { id } = req.params;
        const { name, age } = req.body;
        try {
            await db.collection('users').doc(id).update({ name, age });
            res.status(200).send('User updated successfully');
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send('An unknown error occurred');
            }
        }
    })();
});

// Delete a user by ID
app.delete('/deleteUser/:id', (req: Request, res: Response) => {
    (async () => {
        const { id } = req.params;
        try {
            await db.collection('users').doc(id).delete();
            res.status(200).send('User deleted successfully');
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send('An unknown error occurred');
            }
        }
    })();
});

// Start the server
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
