/* eslint-disable new-cap */
import { Request, Response, Router } from "express";
import * as admin from "firebase-admin";
import { checkAdmin } from "./checkAdmin";

const createUserRoutes = (db: admin.firestore.Firestore) => {
  const router = Router();

  // Middleware for validating user fields
  // eslint-disable-next-line @typescript-eslint/ban-types
  const validateUserFields = (req: Request, res: Response, next: Function) => {
    const { email, firstName, lastName, username } = req.body;

    const missingFields: string[] = [];

    if (!email) missingFields.push("email");
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!username) missingFields.push("username");

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
      const { email, firstName, lastName, password, profilePictureUrl } =
        req.body;

      // Early validation of required fields
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).send("All fields are required.");
      }

      // Email validation
      const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send("Invalid email format.");
      }

      try {
        // Create Firebase user
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
        });

        // Store additional user details in Firestore
        const user = await db.collection("users").add({
          uid: userRecord.uid,
          email,
          firstName,
          lastName,
          profilePictureUrl,
          role: "user",
        });

        return res.status(201).send(`User created with ID: ${user.id}`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          // Handle known errors
          return res.status(400).send(error.message);
        } else {
          // Handle unknown errors
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

  return router;
};
export default createUserRoutes;
