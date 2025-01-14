import { User } from '../database/entity/User';
import { AppDataSource } from '../database';
import { UserInterface } from '../interface';
import {QueryRunner, Repository} from 'typeorm';
import {PostgresDriver} from "typeorm/driver/postgres/PostgresDriver";
import config from "../config";
import {withRLSContext} from "../database/util/withRLSContext";

class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async createUser(user: UserInterface) {
    const newUser = this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  public async getUsers() {
    return await this.userRepository.find();
  }

  public async getUserById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  public async getUserByEmail(email: string, clubId: string, num?:number) {
    console.log(`Getting user by email: ${email} ${clubId}`);
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      // await queryRunner.connect();
      //
      // (AppDataSource.driver as PostgresDriver).master.on("acquire", (client: any) => {
      //   client.query(`SET ROLE ${config.POSTGRESS_NON_ROOT_USER};`);
      //   client.query(`SET SESSION app.current_club_id TO ${+clubId}`);
      // });
      // // Check RLS status
      // const rlsStatus = await queryRunner.query(`
      //   SELECT relname, relrowsecurity
      //   FROM pg_class
      //   WHERE relname = 'user';
      // `);
      // console.log('RLS Status:', rlsStatus);
      //
      // // Check policies
      // const policies = await queryRunner.query(`
      //   SELECT * FROM pg_policies WHERE tablename = 'user';
      // `);
      // console.log('Policies:', policies);
      //
      // const context = await queryRunner.query(`SELECT current_setting('app.current_club_id', true) as current_club_id`);
      // console.log('Current club context:', context);
      //
      // // Use raw query to see exactly what's happening
      // const re = await queryRunner.query(
      //     `SELECT * FROM "user" WHERE email = $1`,
      //     [email]
      // );
      // console.log('Raw query result:', re);
      // console.log(`of ${email}`);
      // // this.userRepository.manager
      //
      // // Try explicit WHERE clause to test
      // const result = await queryRunner.query(
      //   `SELECT * FROM "user" WHERE email = $1 AND "clubId"::TEXT = current_setting('app.current_club_id', true)`,
      //   [email]
      // );
      // console.log('Raw query result with explicit WHERE:', result);
      //
      //
      // const withrepo = await this.userRepository.findOne( {where: { email}});
      // console.log('With repo:', withrepo);
      //
      // return result[0];

      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Set session variables for RLS
      await queryRunner.query(`SET ROLE ${config.POSTGRESS_NON_ROOT_USER};`);
      await queryRunner.query(`SET LOCAL app.current_club_id TO ${+clubId}`);

      // Verify RLS context is set
      const context = await queryRunner.query(`SELECT current_setting('app.current_club_id', true) as current_club_id`);
      console.log('Current club context:', context);

      // Perform repository operation within the QueryRunner context
      const withRepo = await queryRunner.manager.findOne(User, { where: { email } });

      await this.userRepository.query(`SET ROLE ${config.POSTGRESS_NON_ROOT_USER};`);
      await this.userRepository.query(`SET app.current_club_id TO ${+clubId}`);
      const waitTime = (num ?? 1) * 60 * 1000;


      const context1 = await queryRunner.query(`SELECT current_setting('app.current_club_id', true) as current_club_id`);
      console.log('Current club context repo2:', context1);

      const withRepo2 = await this.userRepository.findOne({ where: { email } });
        console.log('With repo2:', withRepo2);

      console.log('With repo:', withRepo);

      const withRep3 = await withRLSContext(clubId, async (queryRunner: QueryRunner) => {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return await queryRunner.manager.findOne(User, { where: { email } });
      });

      console.log('With repo3:', withRep3);

      // Commit transaction
      await queryRunner.commitTransaction();

      return withRep3;
    } finally {
      await queryRunner.release();
    }
  }
}

export default new UserService();
