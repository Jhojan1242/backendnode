import { Request, Response } from "express";

import { getAuthenticatedUser, loginUser, registerUser } from "@/services/auth.service";
import { requireAuthenticatedUser } from "@/utils/request";
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
  const user = await getAuthenticatedUser(requireAuthenticatedUser(req).id);

  return sendSuccessResponse(res, {
    message: "Authenticated user fetched successfully",
    data: user
  });
}

export async function getCoachArea(req: Request, res: Response) {
  const user = requireAuthenticatedUser(req);

  return sendSuccessResponse(res, {
    message: "Coach area fetched successfully",
    data: {
      user,
      permissions: ["create_team", "publish_content"]
    }
  });
}
