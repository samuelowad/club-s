import { User } from '../database/entity/User';
import { AppDataSource } from '../database';
import { UserInterface } from '../interface';


class UserService {
  private userRepository = AppDataSource.getRepository(User);

    public async createUser(user: UserInterface) {
      const newUser = this.userRepository.create(user);
      return await this.userRepository.save(newUser);
    }

    public async getUsers() {
      return await this.userRepository.find();
    }

    public async getUserById(id: number) {
      return await this.userRepository.findOne( {where: { id}});
    }

    public async getUserByEmail(email: string) {
      return await this.userRepository.findOne( {where: { email}});
    }
}

export default new UserService();
