import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../controllers/productController.js";

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? process.env.UPLOAD_DIR
  : path.join(process.cwd(), "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const extAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const mimeAllowed = file.mimetype.startsWith("image/");

  if (extAllowed && mimeAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Nur Bilddateien (jpg, png, webp, gif) sind erlaubt."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/image", upload.single("image"), uploadProductImage);

export default router;
