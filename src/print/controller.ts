import { Controller, Get, Post, Body, Put, Param, Delete, Query, Header, Res } from '@nestjs/common';
import { PrintService } from './service';
import { RequestDto } from './dto/request.dto';
import { Response } from 'express';

@Controller('print')
export class PrintController {
  constructor(private readonly service: PrintService) {}

  @Get()
  async downloadOutput(@Query() request: RequestDto, @Res() res: Response) {
    console.log(request);
    res.set({
      'Content-Type': 'application/pdf',
      // 'Content-Disposition': 'inline'
    });
    const stream = await this.service.getPrintOutput(request.token);
    stream.pipe(res);
  }

}
