import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Entity('tickets')
@Unique(['user_id', 'match_id'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'date' })
  ticket_date: string;

  @Column({ nullable: true })
  match_id?: string;

  @Column({ unique: true })
  ticket_number: string;

  @Column({ unique: true })
  qr_code: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.ACTIVE,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: string;

  @CreateDateColumn()
  created_at: Date;
}
