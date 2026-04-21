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

      req.body = validatedRequest.body ?? req.body;
      req.params = (validatedRequest.params ?? req.params) as Request["params"];
      req.query = (validatedRequest.query ?? req.query) as Request["query"];

      next();
    } catch (error) {
      next(error);
    }
  };
}
