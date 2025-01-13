import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database';
import config from "../config";
import {PostgresDriver} from "typeorm/driver/postgres/PostgresDriver";

export const setClubContext = async (req: Request, res: Response, next: NextFunction) => {
  const clubId = req.header('x-club-id');
  
  if (!clubId) {
    return res.status(400).json({ message: 'Club ID is required in header (x-club-id)' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  // (AppDataSource.driver as PostgresDriver).master.on("acquire", (client: any) => {
  //   client.query(`SET ROLE ${config.POSTGRESS_NON_ROOT_USER};`);
  //   client.query(`SET SESSION app.current_club_id TO ${+clubId}`);
  //   });

  const waitTime = (req.body?.num ?? 1) * 60 * 1000;

  try {
    // Start transaction
    // TODO: add a set timeout for do 1 minute * req.body.num


    await queryRunner.startTransaction();
    
    // Set the RLS policy context
    // console.log('Setting club context to', clubId);
    // // await queryRunner.query(`SET ROLE ${config.POSTGRESS_NON_ROOT_USER};`);
    // // await queryRunner.query(`SET SESSION app.current_club_id TO ${+clubId}`);
    // const result = await queryRunner.query(`SELECT current_setting('app.current_club_id', true) as current_club_id`);
    // console.log(`Verified club context for uer:${req.body?.num}`, result, typeof result[0].current_club_id);
    //
    // const resuust = await queryRunner.query(`SELECT current_user`);
    // console.log(`Verified club context for uer:${req.body?.num}`, resuust, typeof resuust[0]);


    await new Promise((resolve) => setTimeout(resolve, waitTime));

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
