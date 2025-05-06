import { Router } from "express";
import { 
    getUsers, 
    getUser, 
    createUser, 
    updateUser, 
    deleteUser,
    loginUser
} from "../controllers/user.controller.js";
import {
    validateCreateUser,
    validateUpdateUser,
    validateUserId,
    validateLogin
  } from '../validators/user.validator.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', validateUserId, getUser);
router.post('/', validateCreateUser, createUser);
router.post('/login', validateLogin, loginUser);
router.put('/:id', validateUserId, validateUpdateUser, updateUser);
router.delete('/:id', validateUserId, deleteUser);

export default router;