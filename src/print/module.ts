import * as path from 'path';

import { forwardRef, Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';

import { ConfigModule } from '@nestjs/config';
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
        name: 'print',
        path: path.join(__dirname, 'worker.js')
      }],
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
export class PrintModule {}
