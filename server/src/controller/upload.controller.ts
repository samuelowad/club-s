import { Request, Response } from 'express';
import { uploadFile } from '../services/upload.service';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as Request & { file?: Express.Multer.File };

    if (!multerReq.file) {
       res.status(400).json({ message: 'No file uploaded' });
      return
    }
    const image = await uploadFile(multerReq.file);
    res.status(201).json({ message: 'File uploaded successfully', image });
  } catch (error) {
     res.status(500).json({ message: 'Internal Server Error' });
    return
  }
};
