import { Response } from "express";

type SuccessResponseOptions<T> = {
  statusCode?: number;
  message: string;
  data?: T;
};

export function sendSuccessResponse<T>(
  res: Response,
  { statusCode = 200, message, data }: SuccessResponseOptions<T>
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {})
  });
}
