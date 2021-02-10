import * as fs from 'fs';

import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';

import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
const _ = require('lodash');

import { CompletedEventCallback, FailedEventCallback, Job, Queue } from 'bull';
import { InjectQueue, OnGlobalQueueError, Process, Processor } from '@nestjs/bull';

import printConfig from 'src/config/print.config';
import * as gqlSchema from 'src/graphql';  // we don't "expose" GraphQL to services, remember?

import { PrintJob, PrintJobOutput } from './lib';
import { ConfigType } from '@nestjs/config';


@Injectable()
export class PrintService/* implements OnModuleDestroy*/ {

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @InjectQueue('print') private readonly queue: Queue<PrintJob>
  ) {}

  // async onModuleDestroy() {
  //   console.log('onModuleDestroy aaa');
  //   // try {
  //     const purgeQueueJob = await this.queue.getRepeatableJobs().then(repeatableJobs =>
  //       repeatableJobs.find(j => j.name === 'purge-queue')
  //     );
  //     console.log('purgeQueueJob', purgeQueueJob);
  //     if (purgeQueueJob) {
  //       await this.queue.removeRepeatableByKey(purgeQueueJob.key)
  //       .then(() => console.log(purgeQueueJob.key, 'was removed'));
  //     } else {
  //       console.warn('purge-queue job not found');
  //     }
  //     await this.queue.close();
  //   // } catch (error) {
  //   //   console.error(error);
  //   // }
  // }


  async print(templatePath: string, fillData?: Record<string, any>): Promise<gqlSchema.PrintOutput> {
    const token = uuidv4();

    await new Promise<void>(async (resolve, reject) => {
      // Prepare listeners before adding a job to register them faster
      const onCompleted: CompletedEventCallback<PrintJob> = (completedJob: Job<PrintJob>, result: PrintJobOutput) => {
        if (completedJob.id === token) {
          console.log('completed');
          if (result.path) {
            resolve();
          } else {
            reject(new Error('No output from the print job'));
          }
          this.queue.removeListener('completed', onCompleted);
          this.queue.removeListener('failed', onFailed);
          console.log('listeners removed');
        }
      };
      const onFailed: FailedEventCallback<PrintJob> = (failedJob: Job<PrintJob>, reason: Error) => {
        if (failedJob.id === token) {
          reject(reason);
          this.queue.removeListener('failed', onFailed);
          this.queue.removeListener('completed', onCompleted);
          console.log('listeners removed');
        }
      };

      console.log('adding the job...');
      await this.queue.add('print', {
        templatePath,
        fillData
      }, {
        jobId: token,
        timeout: this.config.printJob.timeout
      });

      this.queue.addListener('completed', onCompleted);
      this.queue.addListener('failed', onFailed);
    });

    return { token };
  }


  async getPrintOutput(token: string): Promise<fs.ReadStream> {
    const job = await this.queue.getJob(token);
    if (job) {
      return fs.createReadStream(job.returnvalue?.path);
    } else {
      throw new Error('Job not found for the given token');
    }
  }

}



@Processor('print')
export class PrintQueueConsumer {

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @InjectQueue('print') private readonly queue: Queue
  ) {
    // TODO: remove all jobs/queues on shutdown?..
    // TODO: from docs: "Bull is smart enough not to add the same repeatable job if the repeat options are the same"
    // so probably no need to check the name...
    queue
      .getRepeatableJobs()
      // .getFailed()
      // .then(failedJobs => Promise.all(failedJobs
      //   .filter(j => j.name === 'purge-queue')
      //   .map(j => j.remove().then(() => console.log('remove purge-queue failed job')))
      // ))
      // .then(() => queue.getRepeatableJobs())
      .then(repeatableJobs => {
        // console.log('repeatableJobs', repeatableJobs);
        if (!repeatableJobs.some(j => j.name === 'purge-queue')) {
          // console.log('no purge-queue job found');
          queue.add('purge-queue', null, {
            repeat: { every: config.purgeQueueJob.repeatEvery },
            removeOnComplete: true
          }).then(() => console.log('purge-queue job has been added'));
        }
      });
  }


  @OnGlobalQueueError()  // TODO: this will fire on all instances?...
  onGlobalQueueError(error: Error) {
    console.error(error);
  }


  @Process('purge-queue')
  async purgeQueue(job: Job) {
    console.log('purge-queue job is started, pid:', process.pid);

    const doneJobs = await this.queue.getJobs(['completed', 'failed']);

    await Promise.all(doneJobs
      .filter(job =>
        job.name === 'purge-queue' &&
        job.failedReason === ('Missing process handler for job type ' + 'purge-queue')
      )
      .map(job => {
        console.log('failed purge-queue job', job.id);
        return job.remove();
      })
    );

    await Promise.all(doneJobs
      .filter(job =>
        job.name === 'print' &&
        typeof job.returnvalue?.path === 'string' && job.returnvalue.path.length &&
        DateTime.fromMillis(job.finishedOn!) < DateTime.local().minus(this.config.printJob.removeAfter)
      )
      .map((job: Job<PrintJob>) => {
        console.log('successful print job', job.id);
        fs.unlink(job.returnvalue.path, error => {
          if (error) {
            console.error(error);
          } else {
            console.log(job.returnvalue.path, 'has been removed');
          }
        });
        return job.remove();
      })
    );
  }
}
