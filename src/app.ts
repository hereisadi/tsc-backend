import express from "express";
import cors from "cors";
// import bodyParser from 'body-parser'
import dotEnv from "dotenv";
import ApiRoutes from "./routes/ApiRoutes";
import redirect from "./middlewares/Redirect";
const app = express();

dotEnv.config();
// app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(cors());
redirect;

app.use("/v1/api", ApiRoutes);

export default app;
