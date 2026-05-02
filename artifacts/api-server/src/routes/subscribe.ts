import { Router } from "express";
import { z } from "zod";

const router = Router();

const SubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

const subscribers: Subscriber[] = [];

router.post("/subscribe", (req, res) => {
  const result = SubscribeSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const existing = subscribers.find((s) => s.email === result.data.email);
  if (existing) {
    res.status(200).json({ ok: true, already: true });
    return;
  }

  const entry: Subscriber = {
    id: crypto.randomUUID(),
    email: result.data.email,
    subscribedAt: new Date().toISOString(),
  };

  subscribers.push(entry);
  req.log.info({ id: entry.id }, "New mailing list subscriber");

  res.status(201).json({ ok: true });
});

export { subscribers };
export default router;
