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

const router = Router();

// router.get('/', getUsers);
router.get('/', authenticate, authorize(['admin']), getUsers);
router.get('/:id', validateUserId, getUser);
router.post('/', validateCreateUser, createUser);
router.put('/:id', validateUserId, validateUpdateUser, updateUser);
router.delete('/:id', validateUserId, deleteUser);

export default router;