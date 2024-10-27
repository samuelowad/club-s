import { AppDataSource } from '../database';
import { Email } from '../database/entity/Email';
import { EmailData } from '../interface';

export class EmailService {
  private emailRepository = AppDataSource.getRepository(Email);

    public createEmail(email: EmailData): Promise<Email> {
      try {
        const newEmail = this.emailRepository.create(email);
        return this.emailRepository.save(newEmail);
      } catch (error) {
        console.error('Error during email creation:', error);
        throw error;
      }
    }

    public getEmails() {
      return this.emailRepository.find();
    }

    public getEmailById(id: number){
      return this.emailRepository.findOne({where: {id}});
    }

    public update(email: Email) {
      try {
        return this.emailRepository.save(email);
      }catch (error) {
        console.error('Error during email update:', error);
        throw error;
      }
    }
}

export default new EmailService();
