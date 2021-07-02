import * as fs from 'fs';
import * as path from 'path';

import { forwardRef, Inject, Logger, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';

import { BullModule, InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { ConfigModule, ConfigType } from '@nestjs/config';
import printConfig, { PRINT_JOB_NAME, PRINT_QUEUE_NAME } from 'src/config/print.config';
import appConfig from 'src/config/app.config';

import { TemplateFilesModule } from 'src/template-files/module';
import { TemplateFilesService } from 'src/template-files/service';
import { TemplateTypesModule } from 'src/template-types/module';

import { PrintJob } from './lib';
import { PrintQueue } from './queue';
import { PrintService } from './service';
import { PrintController } from './controller';


@Module({
  imports: [
    ConfigModule.forFeature(printConfig),
    ConfigModule.forFeature(appConfig),
    BullModule.registerQueue({
      name: PRINT_QUEUE_NAME,
      processors: [{
        concurrency: 1,  // seems like this is ignored...
        name: PRINT_JOB_NAME,
        path: path.join(__dirname, 'worker.js')
      }]
    }),
    forwardRef(() => TemplateFilesModule),
    forwardRef(() => TemplateTypesModule)  // need this for successful resolutions
  ],
  controllers: [PrintController],
  providers: [
    PrintService,
    PrintQueue,
    TemplateFilesService
  ],
  exports: [
    BullModule
  ]
})
export class PrintModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(PrintModule.name);

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @Inject(appConfig.KEY) private configApp: ConfigType<typeof appConfig>,
    @InjectQueue(PRINT_QUEUE_NAME) private readonly queue: Queue<PrintJob>
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    createBullBoard({
      queues: [new BullAdapter(this.queue)],
      serverAdapter
    });
    serverAdapter.setBasePath(this.configApp.urlPrefix + '/print/queues');
    consumer.apply(serverAdapter.getRouter()).forRoutes('/print/queues');
  }

  onModuleInit() {
    if (typeof this.config.cachePath === 'string') {
      try {
        fs.accessSync(this.config.cachePath, fs.constants.F_OK);
      } catch {
        this.logger.warn(`print.config.cachePath path (${this.config.cachePath}) doesn't exist, creating one...`);
        fs.mkdirSync(this.config.cachePath, { recursive: true });
      }
      // Check we have necessary file-system permissions (read/write)
      fs.accessSync(this.config.cachePath, fs.constants.R_OK | fs.constants.W_OK);
    } else {
      this.logger.log("print.config.cachePath path not set, system's location for temp files will be used");
    }
  }
}
