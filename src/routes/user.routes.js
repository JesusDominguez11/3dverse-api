import { Router } from "express";
import { 
    getUsers, 
    getUser, 
    createUser, 
    updateUser, 
    deleteUser
} from "../controllers/user.controller.js";
import {
    validateCreateUser,
    validateUpdateUser,
    validateUserId
  } from '../validators/user.validator.js';
  import { authenticate, authorize } from "../middlewares/auth.js";

import { loginUser } from "../controllers/user.controller.js";

const router = Router();

// router.get('/', getUsers);
router.get('/:id', validateUserId, getUser);
router.post('/', validateCreateUser, createUser);
router.put('/:id', validateUserId, validateUpdateUser, updateUser);
router.delete('/:id', validateUserId, deleteUser);

// Ruta de login
router.post('/login', loginUser);
router.get('/', authenticate, authorize(['admin']), getUsers);

export default router;