import { pool } from "../config.js";

export const getProducts = async () => {
    const { rows } = await pool.query(
        "SELECT id, name, price, images, description, category, size FROM products"
    );
    return rows;
};

export const getProductById = async (id) => {
    const { rows } = await pool.query(
        "SELECT id, name, price, images, description, category, size FROM products WHERE id = $1",
        [id]
    );
    return rows[0];
};

export const createProduct = async (productData) => {
    const { name, price, images, description, category, size } = productData;

        // Validación adicional a nivel de servicio
        if (productData.price <= 0) {
            throw new Error("El precio debe ser mayor que cero");
        }
    
        if (productData.images.length === 0) {
            throw new Error("Debe proporcionar al menos una imagen");
        }

    const { rows } = await pool.query(
        `INSERT INTO products 
         (name, price, images, description, category, size) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, name, price, images, description, category, size`,
        [name, price, images, description || null, category, size]
    );
    return rows[0];
};

export const updateProduct = async (id, productData) => {
    const { name, price, images, description, category, size } = productData;
    const { rows } = await pool.query(
        `UPDATE products SET 
         name = $1, 
         price = $2, 
         images = $3, 
         description = $4, 
         category = $5, 
         size = $6,
         updated_at = CURRENT_TIMESTAMP 
         WHERE id = $7 
         RETURNING id, name, price, images, description, category, size`,
        [name, price, images, description || null, category, size, id]
    );
    return rows[0];
};

export const deleteProduct = async (id) => {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
};

// Búsqueda por categoría
export const getProductsByCategory = async (category) => {
    const { rows } = await pool.query(
        "SELECT id, name, price, images, description, category, size FROM products WHERE category = $1",
        [category]
    );
    return rows;
};

// Añade este nuevo método al final del archivo
export const getRelatedProducts = async (productId) => {
    // 1. Primero obtenemos el producto actual para saber su categoría
    const currentProduct = await getProductById(productId);
    if (!currentProduct) {
        throw new Error('Producto no encontrado');
    }

    // 2. Buscamos productos de la misma categoría (excluyendo el actual)
    const { rows } = await pool.query(
        `SELECT id, name, price, images, description, category, size 
         FROM products 
         WHERE category = $1 AND id != $2
         LIMIT 4`,
        [currentProduct.category, productId]
    );

    return rows;
};