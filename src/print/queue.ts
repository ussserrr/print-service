import * as fs from 'fs';

import { Processor, InjectQueue, OnGlobalQueueCompleted, Process } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { Queue, Job } from 'bull';

import { DateTime } from 'luxon';

import printConfig, { PURGE_QUEUE_JOB_NAME, PRINT_JOB_NAME, PRINT_QUEUE_NAME } from 'src/config/print.config';
import { PrintJob } from './lib';


@Processor(PRINT_QUEUE_NAME)
export class PrintQueue {
  private readonly logger = new Logger(PrintQueue.name);

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @InjectQueue(PRINT_QUEUE_NAME) private readonly queue: Queue
  ) {
    queue.getFailed()
      .then(failedJobs => failedJobs.filter(job =>
        job.name === PURGE_QUEUE_JOB_NAME &&
        job.failedReason === ('Missing process handler for job type ' + PURGE_QUEUE_JOB_NAME)  // TODO: try to google and solve this
      ))
      .then(purgeQueueFailedJobs => Promise.all(purgeQueueFailedJobs.map(job => {
        this.logger.log(`Failed "${PURGE_QUEUE_JOB_NAME}" job ${job.id} found, it will be removed`);
        return job.remove();
      })))
      // From docs: "Bull is smart enough not to add the same repeatable job if the repeat options are the same"
      // (i.e. it will be "added" but no duplicates will be planted, even for multi-instance configuration)
      .then(() => queue.add(PURGE_QUEUE_JOB_NAME, null, {
        repeat: { every: config.purgeQueueJob.repeatEveryMs },
        removeOnComplete: true
      }));
  }

  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any) {
    const job = await this.queue.getJob(jobId);
    // console.log('(Global) on completed: job', jobId);
    if (
      job?.name === PRINT_JOB_NAME &&
      job.returnvalue?.path?.length
    ) {
      console.log('(Global) on completed: job', job.id);
    }
  }


  @Process(PURGE_QUEUE_JOB_NAME)
  async purgeQueue(job: Job) {
    const completedJobs = await this.queue.getCompleted();
    const completedRemovedPrintJobs = await Promise.all(completedJobs
      .filter(job =>
        job.name === PRINT_JOB_NAME &&
        job.returnvalue?.path?.length &&
        DateTime.fromMillis(job.finishedOn!) < DateTime.local().minus(this.config.printJob.removeAfter)
      )
      .map((job: Job<PrintJob>) => {
        this.logger.debug(`Successful "${PRINT_JOB_NAME}" job: ${job.id}`);
        fs.unlink(job.returnvalue.path, error => {
          if (error) {
            this.logger.error(error);
          } else {
            this.logger.debug(`File has been removed: ${job.returnvalue.path}`);
          }
        });
        return job.remove();
      })
    );
    this.logger.log(`"${PURGE_QUEUE_JOB_NAME}" job: ${completedRemovedPrintJobs.length} "${PRINT_JOB_NAME}" completed jobs found and removed`);
  }
}