import type { Request, Response } from "express";
import { getSessions } from "../services/conversationService";

export async function sessions(req: Request, res: Response) {
  const data = await getSessions();
  res.json(data);
}
