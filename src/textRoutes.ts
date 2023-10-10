import { Request, Response, Router } from "express";
import * as admin from "firebase-admin";
import { checkFirebaseToken } from "./checkFirebaseToken";

const createTextRoutes = (db: admin.firestore.Firestore) => {
  const router = Router();

  // Get all texts
  router.get("/getAllTexts", (req: Request, res: Response) => {
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
  router.post(
    "/addText",
    checkFirebaseToken,
    async (req: Request, res: Response) => {
      const { title, author, content, language } = req.body;

      if (!title || !author || !content || !language) {
        return res
          .status(400)
          .send("All fields (title, author, content, language) are required.");
      }

      try {
        const text = await db.collection("texts").add({
          title,
          author,
          content,
          language,
        });
        res.status(201).send(`Text created with ID: ${text.id}`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(400).send(error.message);
        } else {
          res.status(400).send("An unknown error occurred");
        }
      }
    }
  );

  // Get a text by ID
  router.get("/getText/:id", async (req: Request, res: Response) => {
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
  });

  // Delete a text by ID
  router.delete(
    "/deleteText/:id",
    checkFirebaseToken,
    async (req: Request, res: Response) => {
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
    }
  );
  return router;
};
export default createTextRoutes;
