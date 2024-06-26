import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import http from "http";
import mongoose from "mongoose";

import dotenv from "dotenv";
import passport from "./config/passport";
import router from "./router";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({ secret: "le_quoc_khanh", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});

// MongoDB connection

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL!);
mongoose.connection.on("error", (error: Error) => {
  console.error(error);
});

app.use("/", router());
