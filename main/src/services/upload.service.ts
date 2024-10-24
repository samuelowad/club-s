import { AppDataSource } from '../database';
import { Image } from '../entity/Image';
import { triggerImageScanner } from '../grpc/grpcClient';
import { ImageStatusEnum } from '../enum/ImageStatus.enum';

export const uploadFile = async (file: Express.Multer.File) => {
  const imageRepository = AppDataSource.getRepository(Image);

  const newImage = new Image();
  newImage.fileName = file.originalname;
  newImage.filePath = file.path;
  const savedImage = await imageRepository.save(newImage);
  // Trigger gRPC to image scanner
  triggerImageScanner(savedImage.id, savedImage.filePath);

  return savedImage;
};

export const upDateUploadedFile = async (imageId: number, explicit: boolean, imageText: string) => {
    const imageRepository = AppDataSource.getRepository(Image);
    const image = await imageRepository.findOne({ where: { id: imageId } });

    if (!image) {
        throw new Error('Image not found');
    }

    image.explicit = explicit;
    image.imageText = imageText;
    image.status = ImageStatusEnum.Completed
    await imageRepository.save(image);

    return image;
}
