import fs from 'fs';
import { uploadImage, deleteImage } from '../services/cloudinary.service.js';
import { upload } from '../middlewares/upload.middleware.js';

export const uploadImageController = async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            message: err.message 
          });
        }
  
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'No se proporcionó ninguna imagen' 
          });
        }
  
        try {
          // Verificar que el archivo existe realmente
          if (!fs.existsSync(req.file.path)) {
            return res.status(500).json({
              success: false,
              message: 'El archivo temporal no se creó correctamente'
            });
          }
  
          // Subir imagen a Cloudinary
          const result = await uploadImage(req.file.path);
          
          // Eliminar el archivo temporal
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Error eliminando archivo temporal:', unlinkError);
          }
  
          return res.status(200).json({
            success: true,
            message: 'Imagen subida correctamente',
            data: {
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes
            }
          });
        } catch (error) {
          // Asegurarse de eliminar el archivo temporal en caso de error
          if (req.file && fs.existsSync(req.file.path)) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
              console.error('Error eliminando archivo temporal:', unlinkError);
            }
          }
          console.error('Error en uploadImageController:', error);
          next(error);
        }
      });
    } catch (error) {
      console.error('Error general en uploadImageController:', error);
      next(error);
    }
  };

export const deleteImageController = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Se requiere el publicId de la imagen' });
    }

    const result = await deleteImage(publicId);
    
    res.status(200).json({
      success: true,
      message: 'Imagen eliminada correctamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};