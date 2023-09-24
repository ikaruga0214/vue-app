import jwt from "jsonwebtoken";

async function auth1(req, res, next) {
  try {
    const token = await req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, "secrets");

    const user = decodedToken;

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ err: new Error("Invalid request") });
  }
}

export default auth1;
