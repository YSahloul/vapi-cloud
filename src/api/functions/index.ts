import { Hono } from "hono";
import { Bindings } from "../../types/hono.types";
import { basicHandler } from "./basic";

const app = new Hono<{ Bindings: Bindings }>();

// Mount the basicHandler to handle all routes
app.route("/", basicHandler);

export { app as functionCallRoute };
