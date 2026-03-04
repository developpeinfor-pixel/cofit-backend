import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get()
  getHome() {
    return this.homeService.getHome();
  }
}
