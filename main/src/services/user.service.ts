import { User } from '../database/entity/User';
import { AppDataSource } from '../database';
import { UserInterface } from '../interface';
import { Repository } from 'typeorm';

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

  public async getUserByEmail(email: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();

      // Check RLS status
      const rlsStatus = await queryRunner.query(`
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relname = 'user';
      `);
      console.log('RLS Status:', rlsStatus);

      // Check policies
      const policies = await queryRunner.query(`
        SELECT * FROM pg_policies WHERE tablename = 'user';
      `);
      console.log('Policies:', policies);

      const context = await queryRunner.query(`SELECT current_setting('app.current_club_id', true) as current_club_id`);
      console.log('Current club context:', context);

      // Use raw query to see exactly what's happening
      const re = await queryRunner.query(
          `SELECT * FROM "user" WHERE email = $1`,
          [email]
      );
      console.log('Raw query result:', re);

      // Try explicit WHERE clause to test
      const result = await queryRunner.query(
        `SELECT * FROM "user" WHERE email = $1 AND "clubId"::TEXT = current_setting('app.current_club_id', true)`,
        [email]
      );
      console.log('Raw query result with explicit WHERE:', result);

      const withrepo = await this.userRepository.findOne( {where: { email}});
      console.log('With repo:', withrepo);

      return result[0];
    } finally {
      await queryRunner.release();
    }
  }
}

export default new UserService();
