import { Router } from 'express';
import { uploadImageController, deleteImageController }  from '../controllers/upload.controller.js';

const router = Router();

router.post('/upload', uploadImageController);
router.delete('/:publicId', deleteImageController);

export default router;