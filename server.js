const express = require("express");
const session = require("express-session");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const ADMIN_PASS = process.env.ADMIN_PASS || "putraproject";

app.use(
  session({
    secret: "putra-project-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/login", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login - PUTRA PROJECT Proxy</title>
        <style>
          body {
            background: #0f0f0f;
            color: white;
            font-family: 'Poppins', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          input {
            padding: 8px;
            border-radius: 6px;
            border: none;
            outline: none;
          }
          button {
            background: #1DB954;
            color: white;
            padding: 8px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h2>PUTRA PROJECT — Secure Proxy</h2>
        <form method="POST" action="/login">
          <input name="password" type="password" placeholder="Masukkan Password" required />
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) {
    req.session.authenticated = true;
    return res.redirect("/");
  } else {
    return res.send("<script>alert('❌ Password salah!');window.location='/login'</script>");
  }
});

app.use((req, res, next) => {
  if (req.session.authenticated || req.path === "/login") next();
  else res.redirect("/login");
});

app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.send("⚠️ URL tidak diberikan.");

  try {
    const response = await fetch(target);
    const contentType = response.headers.get("content-type");
    res.set("content-type", contentType);
    const body = await response.text();
    res.send(body);
  } catch (err) {
    res.status(500).send("❌ Terjadi kesalahan: " + err.message);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
