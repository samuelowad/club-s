import { Seat } from '../database/entity/Seat';
import { Event } from '../database/entity/Event';
import { AppDataSource } from '../database';


class SeatService {
  private seatRepository = AppDataSource.getRepository(Seat);

  async createSeat(availableTickets: number, event: Event) {

    const seats = [];
    for (let i = 1; i <= availableTickets; i++) {
      const seat = new Seat();
      seat.seatNumber = `Seat ${i}`;
      seat.isAvailable = true;
      seat.event = event;
      seats.push(seat);
    }

    const newSeats = this.seatRepository.create(seats);
    return await this.seatRepository.save(newSeats);
  }

    async update( seats: Seat[]) {
      await this.seatRepository.save(seats);
    }
}

export default new SeatService();
