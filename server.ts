import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || "super_secret_bolivian_key";

app.use(cors());
app.use(express.json());

// Init Database
const db = new Database("database.sqlite", { verbose: console.log });

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );
  
  CREATE TABLE IF NOT EXISTS allowed_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    employee_name TEXT,
    period TEXT,
    total_ganado REAL,
    liquido_pagable REAL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert admin if allowed_emails is empty
const allowedCount = db.prepare("SELECT COUNT(*) as count FROM allowed_emails").get() as { count: number };
if (allowedCount.count === 0) {
  db.prepare("INSERT INTO allowed_emails (email) VALUES (?)").run("admin@bolivia.gob.bo");
  const hashed = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("admin@bolivia.gob.bo", hashed, "admin");
}

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  
  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '8h' });
  res.json({ token, user: { email: user.email, role: user.role } });
});

// Register
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  
  // Check if allowed
  const isAllowed = db.prepare("SELECT * FROM allowed_emails WHERE email = ?").get(email);
  if (!isAllowed) {
    return res.status(403).json({ error: "Este correo no está autorizado." });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existingUser) {
    return res.status(400).json({ error: "El usuario ya existe." });
  }

  const hashed = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashed);
  res.json({ message: "Usuario registrado exitosamente." });
});

// Allowed Emails (Admin only)
app.get("/api/allowed-emails", authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const emails = db.prepare("SELECT * FROM allowed_emails").all();
  res.json(emails);
});

app.post("/api/allowed-emails", authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { email } = req.body;
  
  try {
    const info = db.prepare("INSERT INTO allowed_emails (email) VALUES (?)").run(email);
    res.json({ id: info.lastInsertRowid, email });
  } catch (error) {
    res.status(400).json({ error: "El correo ya está en la lista." });
  }
});

app.delete("/api/allowed-emails/:id", authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.prepare("DELETE FROM allowed_emails WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Records
app.get("/api/records", authenticateToken, (req: any, res: any) => {
  const records = db.prepare("SELECT * FROM records ORDER BY created_at DESC").all();
  // parse data field
  const parsedRecords = records.map((r: any) => ({
    ...r,
    data: JSON.parse(r.data)
  }));
  res.json(parsedRecords);
});

app.post("/api/records", authenticateToken, (req: any, res: any) => {
  const { employee_name, period, total_ganado, liquido_pagable, data } = req.body;
  
  const info = db.prepare(
    "INSERT INTO records (user_id, employee_name, period, total_ganado, liquido_pagable, data) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(req.user.id, employee_name, period, total_ganado, liquido_pagable, JSON.stringify(data));
  
  res.json({ id: info.lastInsertRowid });
});

app.delete("/api/records/:id", authenticateToken, (req: any, res: any) => {
  db.prepare("DELETE FROM records WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
  });
}

startServer();
