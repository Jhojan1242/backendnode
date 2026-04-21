import { Request, Response } from "express";

import { env } from "../../configs/env";
import { sendSuccessResponse } from "../../common/http/send-response";

export async function getHealth(_req: Request, res: Response) {
  return sendSuccessResponse(res, {
    message: "API is running",
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
}
