import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/configs/env";
import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { JwtPayload } from "@/types/auth.types";

function getBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader) {
    throw new AppError("Authorization token is required", 401);
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authorization header must use Bearer token", 401);
  }

  return token;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req.headers.authorization);
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!payload.sub) {
      throw new AppError("Invalid token payload", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        isCoachValidated: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError("Authenticated user no longer exists", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account is inactive", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Invalid or expired token", 401));
    }

    return next(error);
  }
}

export function requireRole(...allowedRoles: JwtPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication is required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }

    return next();
  };
}
