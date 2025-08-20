import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

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
let clerkClient: any;
let getAuth: any;

if (isClerkAvailable()) {
  try {
    const clerk = require("@clerk/express");
    clerkClient = clerk.clerkClient;
    getAuth = clerk.getAuth;
  } catch (error) {
    console.log("Clerk import failed in auth middleware");
  }
}

// Extend Request interface to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log("Authentication middleware called");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("req.auth:", req.auth);
  console.log("req.userId:", req.userId);
  
  // In development mode, always allow requests to pass
  if (process.env.NODE_ENV !== "production") {
    // For development, set a mock userId if none exists
    if (!req.userId) {
      req.userId = "dev_user_123";
    }
    console.log("Development mode: allowing unauthenticated request with userId:", req.userId);
    return next();
  }
  
  // Production mode: check for proper authentication
  if (!req?.auth) {
    //! req.auth will only be defined if the request sends a valid session token
    throw new UnauthorizedError("Unauthorized");
  }

  // clerkClient.users.updateUser(req.auth.userId, {
  //   publicMetadata: {
  //   },
  // });

  //! By calling req.auth() or passing the request to getAuth() we can get the auth data from the request
  //! userId can be obtained from the auth object
  // console.log(req.auth());
  // console.log(getAuth(req));
  next();
};

export default isAuthenticated;