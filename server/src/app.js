import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

import {
  ProductRouter,
  CartRouter,
  OrderRouter,
  ImageRouter,
  EcommerceUserRouter,
} from "#ecommerece/routes";

import {
  ApplicationRouter,
  CompanyRouter,
  JobRouter,
  JobPortalUserRouter,
} from "#jobPortal/routes";

import { errorHandler } from "#ecommerece/middlewares";

const ROUTE_PREFIX = "/api";
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS?.split(",") || []),
].filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(ROUTE_PREFIX + "/ecom/products", ProductRouter);
app.use(ROUTE_PREFIX + "/ecom/cart", CartRouter);
app.use(ROUTE_PREFIX + "/ecom/orders", OrderRouter);
app.use(ROUTE_PREFIX + "/ecom/images", ImageRouter);
app.use(ROUTE_PREFIX + "/ecom/user", EcommerceUserRouter);

app.use(ROUTE_PREFIX + "/jobPortal/application", ApplicationRouter);
app.use(ROUTE_PREFIX + "/jobPortal/company", CompanyRouter);
app.use(ROUTE_PREFIX + "/jobPortal/job", JobRouter);
app.use(ROUTE_PREFIX + "/jobPortal/user", JobPortalUserRouter);
app.use(errorHandler);

export default app;
