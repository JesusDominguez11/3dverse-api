import express from "express";
import { PORT } from "./config.js";
import { config } from "dotenv";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import pg from "pg";

config()

const app = express()
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

// Middlewares
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use("/products", productRoutes);
// Basic routes
app.get('/', (req, res) => {
    res.send('API de 3Dverse');
});
app.get('/ping', async (req, res) => {
    const result = await pool.query('SELECT NOW()')
    return res.json(result.rows[0])
})

app.listen(PORT)
console.log('Server on port', PORT)