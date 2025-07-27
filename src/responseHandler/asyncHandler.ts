import type { NextFunction, Request, Response } from "express";
import { AppLogger } from "../logger";
import { Result } from "./Result";

const logger = new AppLogger();

/**
 * Async handler to wrap the API routes, allowing for async error handling and response sending.
 * @param fn Function to call for the API endpoint
 * @returns Promise with a catch statement
 */

export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<Result<object | unknown>>
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req, res, next);
      // Send the response
      if (!res.headersSent) {
        const { code, message, data } = result;
        res.status(200).json({ code, message, data });
      }
    } catch (error) {
      // Pass the error to the error handling middleware
      logger.error(error as object);
      next(error);
    }
  };
