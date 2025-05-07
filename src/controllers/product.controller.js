import * as productService from "../services/product.service.js";

export const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener productos",
            error: error.message 
        });
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener el producto",
            error: error.message 
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productService.updateProduct(
            req.params.id,
            req.body
        );
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const products = await productService.getProductsByCategory(
            req.params.category
        );
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Añade este nuevo método al final del archivo
export const getRelatedProducts = async (req, res) => {
    try {
        const relatedProducts = await productService.getRelatedProducts(req.params.id);
        res.status(200).json(relatedProducts);
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ 
            message: "Error al obtener productos relacionados",
            error: error.message 
        });
    }
};