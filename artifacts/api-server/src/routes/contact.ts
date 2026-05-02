import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./admin";

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(2000),
});

interface ContactEntry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
}

const submissions: ContactEntry[] = [];

router.post("/contact", (req, res) => {
  const result = ContactSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const entry: ContactEntry = {
    id: crypto.randomUUID(),
    ...result.data,
    receivedAt: new Date().toISOString(),
  };

  submissions.push(entry);

  req.log.info(
    { id: entry.id, subject: entry.subject },
    "Contact form submission received",
  );

  res.status(201).json({ ok: true, id: entry.id });
});

router.get("/contact", requireAuth, (_req, res) => {
  res.json({ submissions });
});

export default router;
