import * as fs from 'fs';
import * as path from 'path';

import { forwardRef, Inject, Logger, Module, OnModuleInit } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';

import { ConfigModule, ConfigType } from '@nestjs/config';
import printConfig, { PRINT_JOB_NAME, PRINT_QUEUE_NAME } from 'src/config/print.config';
import appConfig from 'src/config/app.config';

import { TemplateFilesModule } from 'src/template-files/module';
import { TemplateFilesService } from 'src/template-files/service';
import { TemplateTypesModule } from 'src/template-types/module';

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
export class PrintModule implements OnModuleInit {
  private readonly logger = new Logger(PrintModule.name);

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>
  ) {}

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
