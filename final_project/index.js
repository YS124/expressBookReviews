const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const sessionSecret = "fingerprint_customer"; // Use a strong secret

app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true } // Set HttpOnly flag (recommended)
}));

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.post("/customer/login", (req, res) => {
  // Implement login logic using authenticatedUser function
  const { username, password } = req.body;
  // ... (rest of login logic)

  // Successful login
  const token = jwt.sign({ user: username }, "secret", { expiresIn: '30m' });
  req.session.authorization = { accessToken: token };

  return res.status(200).json({ message: "Login successful" });
});

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
  
    const token = authHeader.split(' ')[1];
    jwt.verify(token, "secret", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    });
}

app.use("/customer", function (req, res, next) {
  // Any routes under /customer will require authentication
  auth(req, res, next);
});

const PORT = 5000;


app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
