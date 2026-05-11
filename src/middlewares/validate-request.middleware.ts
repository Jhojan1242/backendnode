import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RequestSchema = z.ZodObject<{
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
}>;

export function validateRequest(schema: RequestSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validatedRequest = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (validatedRequest.body) {
        req.body = validatedRequest.body;
      }

      if (validatedRequest.params) {
        Object.assign(req.params, validatedRequest.params);
      }

      if (validatedRequest.query) {
        Object.assign(req.query as object, validatedRequest.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
