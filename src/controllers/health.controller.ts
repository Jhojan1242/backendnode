import { Request, Response } from "express";

import { healthService } from "@/services/health.service";
import { sendSuccessResponse } from "@/utils/send-response";

export async function getHealth(_req: Request, res: Response) {
  const health = await healthService();

  return sendSuccessResponse(res, {
    message: "API is running",
    data: health
  });
}
