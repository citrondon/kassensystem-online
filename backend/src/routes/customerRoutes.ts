import { Router } from "express";
import {
  getCustomers,
  createCustomer,
  getDebts,
  markDebtPaid,
} from "../controllers/customerController.js";

const router = Router();

// Manager-only guard could be added here; keeping open for cashier use
router.get("/", getCustomers);
router.post("/", createCustomer);
router.get("/debts", getDebts);
router.patch("/debts/:id/paid", markDebtPaid);

export default router;
