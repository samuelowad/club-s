import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database';

export const setClubContext = async (req: Request, res: Response, next: NextFunction) => {
  const clubId = req.header('x-club-id');
  
  if (!clubId) {
    return res.status(400).json({ message: 'Club ID is required in header (x-club-id)' });
  }

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Start transaction
    await queryRunner.startTransaction();
    
    // Set the RLS policy context
    console.log('Setting club context to', clubId);
    await queryRunner.query(`SET ROLE normal_user;`);
    await queryRunner.query(`SET SESSION app.current_club_id TO ${+clubId}`);

    // Commit transaction
    await queryRunner.commitTransaction();
    
    next();
  } catch (error) {
    console.log('Error setting club context:', error);
    // Rollback transaction on error
    await queryRunner.rollbackTransaction();
    next(error);
  } finally {
    // Release query runner
    await queryRunner.release();
  }
};
