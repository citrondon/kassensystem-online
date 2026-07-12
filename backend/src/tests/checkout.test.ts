import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";
import { loginAs } from "./helpers.js";

describe("POST /api/checkout", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/api/checkout").send({ items: [] });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects an empty cart", async () => {
    const { token } = await loginAs("cashier");
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects an invalid item", async () => {
    const { token } = await loginAs("cashier");
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: 1, quantity: 0 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects cash payment with insufficient tendered amount", async () => {
    const { token } = await loginAs("cashier");
    const products = await request(app).get("/api/products");
    const apple = products.body.find((p: { name: string }) => p.name === "Apfel");
    expect(apple).toBeDefined();

    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: apple.id, quantity: 1 }],
        paymentMethod: "cash",
        amountTendered: 0.1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("processes a valid cash checkout with change", async () => {
    const { token } = await loginAs("cashier");
    const products = await request(app).get("/api/products");
    const apple = products.body.find((p: { name: string }) => p.name === "Apfel");
    expect(apple).toBeDefined();

    const before = apple.stock;

    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: apple.id, quantity: 1 }],
        paymentMethod: "cash",
        amountTendered: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.changeAmount).toBeGreaterThan(0);

    const afterRes = await request(app).get(`/api/products?searchTerm=${apple.name}`);
    const afterProduct = afterRes.body.find((p: { name: string }) => p.name === apple.name);
    expect(afterProduct.stock).toBe(before - 1);
  });

  it("rejects a discount greater than the gross amount", async () => {
    const { token } = await loginAs("cashier");
    const products = await request(app).get("/api/products");
    const apple = products.body.find((p: { name: string }) => p.name === "Apfel");
    expect(apple).toBeDefined();

    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: apple.id, quantity: 1 }],
        discountAmount: 100,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
