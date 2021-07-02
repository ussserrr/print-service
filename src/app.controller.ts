import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from './config/app.config';


@Controller()
export class AppController {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>
  ) {}

  @Get()
  index() {
    return `
      <!doctype html>
      <html lang="ru">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Сервис печати</title>
          <meta name="description" content="Управление печатными шаблонами">
          <meta name="author" content="Andrey Chufyrev">
        </head>
        <body>
          <h1>Сервис печати</h1>
          <ul>
            <li><a href="${this.config.urlPrefix}/docs">Документация</a></li>
            <li><a href="/">Панель управления</a></li>
            <li><a href="${this.config.urlPrefix}/print/queues">Очередь печати</a></li>
          </ul>
        </body>
      </html>
    `;
  }
}
