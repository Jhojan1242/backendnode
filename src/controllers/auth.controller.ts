import { Request, Response } from "express";

import { AppError } from "@/errors/app-error";
import { getAuthenticatedUser, loginUser, registerUser } from "@/services/auth.service";
import { sendSuccessResponse } from "@/utils/send-response";

export async function register(req: Request, res: Response) {
  const result = await registerUser(req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: result
  });
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.body);

  return sendSuccessResponse(res, {
    message: "Login successful",
    data: result
  });
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  const user = await getAuthenticatedUser(req.user.id);

  return sendSuccessResponse(res, {
    message: "Authenticated user fetched successfully",
    data: user
  });
}

export async function getCoachArea(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  return sendSuccessResponse(res, {
    message: "Coach area fetched successfully",
    data: {
      user: req.user,
      permissions: ["create_team", "publish_content"]
    }
  });
}
