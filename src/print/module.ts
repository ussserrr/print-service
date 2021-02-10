import * as path from 'path';

import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';

import { PrintQueueConsumer, PrintService } from './service';
import { PrintController } from './controller';


@Module({
  imports: [
    BullModule.registerQueue({
      name: 'print',
      processors: [{
        name: 'print',
        path: path.join(__dirname, 'worker.js')
      }],
      defaultJobOptions: {
        timeout: 30 * 1000  // TODO: test
      }
    }),
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
    PrintQueueConsumer
  ],
  exports: [
    BullModule,
    PrintService
  ]
})
export class PrintModule {}
