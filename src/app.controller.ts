import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Post('/body')
  postBody(@Body() body: any): any {
    return this.appService.posyBody(body);
  }
}
