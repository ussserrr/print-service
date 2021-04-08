import * as fs from 'fs';
import * as path from 'path';

import { forwardRef, Inject, Module, OnModuleInit } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';

import { ConfigModule, ConfigType } from '@nestjs/config';
import printConfig from 'src/config/print.config';

import { TemplateFilesModule } from 'src/template-files/module';
import { TemplateFilesService } from 'src/template-files/service';

import { PrintQueueConsumer, PrintService } from './service';
import { PrintController } from './controller';
import { TemplateTypesModule } from 'src/template-types/module';


@Module({
  imports: [
    ConfigModule.forFeature(printConfig),
    BullModule.registerQueue({
      name: 'print',
      processors: [{
        concurrency: 1,  // seems like this is ignored...
        name: 'print',
        path: path.join(__dirname, 'worker.js')
      }]
    }),
    forwardRef(() => TemplateFilesModule),
    forwardRef(() => TemplateTypesModule)  // need this for successful resolutions
    // CacheModule.registerAsync({
    //   imports: [ConfigModule.forFeature(cacheConfig)],
    //   inject: [cacheConfig.KEY],
    //   useFactory: (config: ConfigType<typeof cacheConfig>) => config
    // })
  ],
  controllers: [PrintController],
  providers: [
    // PrintController,
    PrintService,
    PrintQueueConsumer,
    TemplateFilesService
  ],
  exports: [
    BullModule,
    // PrintService
  ]
})
export class PrintModule implements OnModuleInit {
  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
  ) {}

  onModuleInit() {
    if (typeof this.config.cachePath === 'string') {
      try {
        fs.accessSync(this.config.cachePath, fs.constants.F_OK);
      } catch {
        console.info(`print.config.cachePath path (${this.config.cachePath}) doesn't exist, creating one...`);
        fs.mkdirSync(this.config.cachePath, { recursive: true });
      }
      // Check we have necessary file-system permissions (read/write)
      fs.accessSync(this.config.cachePath, fs.constants.R_OK | fs.constants.W_OK);
    } else {
      console.info("print.config.cachePath path not set, system's location for temp files will be used");
    }
  }
}
