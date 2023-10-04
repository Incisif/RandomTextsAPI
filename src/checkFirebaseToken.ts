import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Middleware to check Firebase token
interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
  }
  
  async function verifyToken(req: AuthenticatedRequest) {
    const idToken = req.headers.authorization;
    const decodedToken = await admin.auth().verifyIdToken(idToken as string);
    req.user = decodedToken;
  }
  
 export const checkFirebaseToken: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => void = async (req, res, next) => {
    try {
      await verifyToken(req);
      next();
    } catch (error) {
      res.status(403).send("Unauthorized");
    }
  };

  export default checkFirebaseToken;