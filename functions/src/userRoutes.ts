/* eslint-disable new-cap */
import { Request, Response, Router } from "express";
import * as admin from "firebase-admin";
import { checkAdmin } from "./checkAdmin";

const createUserRoutes = (db: admin.firestore.Firestore) => {
  const router = Router();

  // eslint-disable-next-line @typescript-eslint/ban-types
  // Middleware for validating user fields
  const validateUserFields = (req: Request, res: Response, next: Function) => {
    const { email, firstName, lastName, password, signInMethod } = req.body;

    const missingFields: string[] = [];

    if (!email) missingFields.push("email");
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (signInMethod === "standard" && !password)
      missingFields.push("password");

    if (missingFields.length > 0) {
      return res
        .status(400)
        .send(`Missing fields: ${missingFields.join(", ")}`);
    }

    return next();
  };

  // Create a new user with mandatory fields and hashed password
  router.post(
    "/createUser",
    validateUserFields,
    async (req: Request, res: Response) => {
      const {
        email,
        firstName,
        lastName,
        password,
        profilePictureUrl,
        signInMethod,
        uid,
      } = req.body;

      try {
        //check if user already exists
        const existingUserSnapshot = await db
          .collection("users")
          .where("email", "==", email)
          .get();
        if (!existingUserSnapshot.empty) {
          // User already exists
          return res.status(409).send("User already exists");
        }

        if (signInMethod === "standard") {
          //User created with email and password
          const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
          });

          // Store additional details in Firestore
          const user = await db.collection("users").add({
            uid: userRecord.uid,
            email,
            firstName,
            lastName,
            profilePictureUrl: profilePictureUrl || null,
            role: "user",
            // Ajouter d'autres champs si nécessaire
          });

          return res.status(201).send(`User created with ID: ${user.id}`);
        } else if (signInMethod === "google") {
          // Utilisateur déjà créé via Google SignIn
          // Enregistrer les détails dans Firestore
          const user = await db.collection("users").add({
            uid,
            email,
            firstName,
            lastName,
            profilePictureUrl: profilePictureUrl || null,
            role: "user",
            // Ajouter d'autres champs si nécessaire
          });

          return res.status(201).send(`User created with ID: ${user.id}`);
        } else {
          // Gérer le cas où signInMethod n'est pas 'standard' ou 'google'
          return res.status(400).send("Invalid sign-in method");
        }
      } catch (error) {
        if (error instanceof Error) {
          return res.status(400).send(error.message);
        } else {
          return res.status(400).send("An unknown error occurred");
        }
      }
    }
  );

  // Get a user by ID
  router.get(
    "/getUser/:id",
    checkAdmin,
    async (req: Request, res: Response) => {
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
    }
  );

  // Update a user by ID using PATCH for partial updates
  router.patch(
    "/updateUser/:id",
    checkAdmin,
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const updatedFields = req.body; // Prend tous les champs fournis dans le body

      try {
        // Mise à jour de l'utilisateur dans Firebase (pour les champs pris en charge)
        if (updatedFields.password || updatedFields.email) {
          const updateData: admin.auth.UpdateRequest = {};
          if (updatedFields.password)
            updateData.password = updatedFields.password;
          if (updatedFields.email) updateData.email = updatedFields.email;
          await admin.auth().updateUser(id, updateData);
        }

        // Mise à jour des champs supplémentaires dans Firestore
        await db.collection("users").doc(id).update(updatedFields);

        res.status(200).send("User updated successfully");
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(400).send(error.message);
        } else {
          res.status(400).send("An unknown error occurred");
        }
      }
    }
  );

  // Delete a user by ID
  router.delete(
    "/deleteUser/:id",
    checkAdmin,
    async (req: Request, res: Response) => {
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
    }
  );

  router.get("/userExists/:email", async (req: Request, res: Response) => {
    const { email } = req.params;
  
    try {
      const userSnapshot = await db.collection("users").where("email", "==", email).get();
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        res.status(200).json(userData);
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send("An unknown error occurred");
      }
    }
  });
  

  //Route for updating user's session stats
  router.put("/updateSessionStats/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { sessionStats } = req.body;

    try {
      await db.collection("users").doc(id).update({
        sessionStats, //Update sessionStats field with the new value
      });
      res.status(200).send("Session stats updated successfully");
    } catch (error: unknown) {
      // Handle errors
    }
  });
  // Get session stats for a user by ID
  router.get("/getSessionStats/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const userDoc = await db.collection("users").doc(id).get();

      if (!userDoc.exists) {
        return res.status(404).send("User not found");
      }

      const userData = userDoc.data();
      if (userData?.sessionStats) {
        return res.status(200).json(userData.sessionStats);
      } else {
        return res.status(404).send("Session stats not found for this user");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).send(error.message);
      } else {
        return res.status(400).send("An unknown error occurred");
      }
    }
  });

  return router;
};
export default createUserRoutes;
