import { Router } from 'express';
import { uploadImage } from '../controller/upload.controller';
import { upload } from '../config/storage.config';

const router = Router();

router.post('/upload', upload.single('file'), uploadImage);

export default router;
