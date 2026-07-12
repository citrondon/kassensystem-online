import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      res.status(400).json({
        success: false,
        error: "Validierungsfehler",
        details: messages,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function formatZodError(error: ZodError): string {
  return error.issues.map((i) => i.message).join(" ");
}
