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

const router = Router();

router.get("/", getProducts);
router.get("/:id", validateProductId, getProduct);
router.post("/", validateCreateProduct, createProduct);
router.put("/:id", validateProductId, validateUpdateProduct, updateProduct);
router.delete("/:id", validateProductId, deleteProduct);
router.get("/category/:category", validateCategory, getProductsByCategory);

export default router;