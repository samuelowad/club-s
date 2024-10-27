import { AppDataSource } from '../database';
import { Email } from '../database/entity/Email';
import { EmailData } from '../interface';
import { EmailStatus } from '../enum';
import { generateBookingConfirmationEmail } from '../utils/email.util';

class EmailService {
  private emailRepository = AppDataSource.getRepository(Email);

  public createEmail(email: EmailData): Promise<Email> {
    try {
      email.subject = email.subject || 'Booking confirmation';
      email.body = generateBookingConfirmationEmail(email);

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

  public async getPendingEmails() {
    return this.emailRepository.find({ where: { status: EmailStatus.PENDING } });
  }

  public update(email: Email) {
    console.log('Updating email:', email);
    try {
      return this.emailRepository.save(email);
    }catch (error) {
      console.error('Error during email update:', error);
      throw error;
    }
  }
}

export default new EmailService();
