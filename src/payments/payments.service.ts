import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  findByUser(userId: string) {
    return this.paymentsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findAllAdmin() {
    return this.paymentsRepository.find({ order: { created_at: 'DESC' } });
  }
}
