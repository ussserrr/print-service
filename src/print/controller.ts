import { Controller, Get, HttpException, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Res, Sse, MessageEvent, Query, ParseIntPipe } from '@nestjs/common';

import { Response } from 'express';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TemplateFilesService } from 'src/template-files/service';

import { PrintService } from './service';



@Controller('print')
export class PrintController {
  constructor(
    private readonly service: PrintService,
    private readonly templateFilesService: TemplateFilesService
  ) {}


  @Sse('sse')
  sse(@Query('userId', ParseIntPipe) userId: number): Observable<MessageEvent> {
    return this.service.listenForJobs(userId).pipe<MessageEvent>(
      map(result => ({ data: result }))
    );
  }


  @Get('output/:token')
  async downloadPrintOutput(
    @Param('token', ParseUUIDPipe) token: string,
    @Res() res: Response
  ) {
    const [path, name] = await this.service.getPrintOutput(token);
    res.sendFile(path, {
      headers: {
        'Content-Disposition': `inline; filename=${name}`
      }
    });
  }


  @Get('raw/:fileId')
  async downloadRawTemplate(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response
  ) {
    const filePath = await this.templateFilesService.download(fileId).catch(error => {
      if (error.name === 'EntityNotFound') {
        throw new NotFoundException(`TemplateFile with id="${fileId}" not found`);
      } else if (error.message) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw error;
      }
    });
    res.download(filePath);
  }


  @Get('config')
  getConfig() {
    return this.service.getConfig();
  }

}
