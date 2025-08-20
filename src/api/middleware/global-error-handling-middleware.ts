import ValidationError from "../../domain/errors/validation-error";
import NotFoundError from "../../domain/errors/not-found-error";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

import { Request, Response, NextFunction } from "express";

const globalErrorHandlingMiddleware = (err:Error, req:Request, res:Response, next:NextFunction) => {
  // Log the full error for debugging in development
  // Do not leak internals to clients; keep responses minimal
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  const message = (err as any)?.message || "Internal server error";
  if (err instanceof ValidationError) {
    res.status(400).json({ message });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({ message });
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ message });
  } else {
    res.status(500).json({ message });
  }
};

export default globalErrorHandlingMiddleware;