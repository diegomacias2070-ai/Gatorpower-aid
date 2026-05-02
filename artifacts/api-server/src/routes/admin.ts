import { Router, type Request, type Response, type NextFunction } from "express";

const router = Router();

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? process.env.SESSION_SECRET ?? "changeme";
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== getAdminPassword()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (typeof password !== "string" || password !== getAdminPassword()) {
    req.log.warn("Admin login failed");
    res.status(401).json({ error: "Wrong password" });
    return;
  }
  req.log.info("Admin login successful");
  res.json({ token: password });
});

export { requireAuth };
export default router;
