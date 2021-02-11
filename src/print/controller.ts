import { Controller, Get, Query, Res } from '@nestjs/common';

import { Response } from 'express';

import { PrintService } from './service';
import { RequestDto } from './dto/request.dto';


@Controller('print')
export class PrintController {
  constructor(private readonly service: PrintService) {}

  @Get()
  async downloadOutput(@Query() query: RequestDto, @Res() res: Response) {
    console.log(query);
    res.set({
      'Content-Type': 'application/pdf',
      // 'Content-Disposition': 'inline'
    });
    const stream = await this.service.getPrintOutput(query.token);
    stream.pipe(res);
  }

}
