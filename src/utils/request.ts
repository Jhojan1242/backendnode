import { Request } from "express";

import { AppError } from "@/errors/app-error";

export function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user;
}

export function getParamValue(value: string | string[], label: string) {
  if (Array.isArray(value)) {
    throw new AppError(`${label} is invalid`, 400);
  }

  return value;
}
