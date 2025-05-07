import { Router } from "express";
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory
} from "../controllers/product.controller.js";
import {
    validateCreateProduct,
    validateUpdateProduct,
    validateProductId,
    validateCategory
} from "../validators/product.validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", validateProductId, getProduct);
router.post("/", authenticate, authorize(['admin']), validateCreateProduct, createProduct);
router.put("/:id", authenticate, authorize(['admin']), validateProductId, validateUpdateProduct, updateProduct);
router.delete("/:id", authenticate, authorize(['admin']), validateProductId, deleteProduct);
router.get("/category/:category", validateCategory, getProductsByCategory);

export default router;