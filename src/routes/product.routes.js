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
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// router.get("/", getProducts);
// router.get("/:id", getProduct);
// router.post("/", createProduct);
// router.put("/:id", updateProduct);
// router.delete("/:id", deleteProduct);
// router.get("/category/:category", getProductsByCategory);

router.get("/", getProducts);
router.get("/:id", validateProductId, getProduct);
// router.post("/", validateCreateProduct, createProduct);
router.post('/', authenticate, authorize(['admin']), createProduct);
router.put("/:id", validateProductId, validateUpdateProduct, updateProduct);
router.delete("/:id", validateProductId, deleteProduct);
router.get("/category/:category", validateCategory, getProductsByCategory);

export default router;