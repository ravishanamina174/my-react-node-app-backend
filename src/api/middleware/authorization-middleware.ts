import { Request, Response, NextFunction } from "express";
// import UnauthorizedError from "../../domain/errors/unauthorized-error";
import ForbiddenError from "../../domain/errors/forbidden-error";

// Check if Clerk is available without importing it
const isClerkAvailable = () => {
  try {
    require.resolve("@clerk/express");
    return true;
  } catch {
    return false;
  }
};

// Only import Clerk if it's available
let getAuth: any;

if (isClerkAvailable()) {
  try {
    const clerk = require("@clerk/express");
    getAuth = clerk.getAuth;
  } catch (error) {
    console.log("Clerk import failed in authorization middleware");
  }
}

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // In development mode, allow admin access
  if (process.env.NODE_ENV !== "production") {
    return next();
  }
  
  // Only check admin status if Clerk is available
  if (getAuth) {
    try {
      const auth = getAuth(req);
      const userIsAdmin = auth.sessionClaims?.metadata?.role === "admin";

      if (!userIsAdmin) {
        throw new ForbiddenError("Forbidden");
      }
    } catch (error) {
      console.log("Clerk getAuth failed in authorization middleware");
      throw new ForbiddenError("Forbidden");
    }
  }
  
  next();
};

export { isAdmin };