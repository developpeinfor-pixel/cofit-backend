import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    return this.createWithRole(createUserDto, Role.USER);
  }

  async createWithRole(
    createUserDto: CreateUserDto,
    role: Role,
  ): Promise<Omit<User, 'password_hash'>> {
    const existingByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingByEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingByPhone = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });
    if (existingByPhone) {
      throw new BadRequestException('Phone already in use');
    }

    const { password, ...rest } = createUserDto;
    const password_hash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      role,
      password_hash,
    });

    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitize(user);
  }

  async findAll() {
    const users = await this.userRepository.find({ order: { created_at: 'DESC' } });
    return users.map((u) => this.sanitize(u));
  }

  async findAdminAccounts() {
    const users = await this.userRepository.find({
      where: [
        { role: Role.ADMIN_GENERAL },
        { role: Role.ADMIN_SENIOR },
        { role: Role.ADMIN_JUNIOR },
      ],
      order: { created_at: 'DESC' },
    });
    return users.map((u) => this.sanitize(u));
  }

  sanitize(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...safe } = user;
    return safe;
  }
}
