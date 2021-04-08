import * as path from 'path';
import * as fs from 'fs';

import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { Job, Queue } from 'bull';
import { InjectQueue, OnGlobalQueueCompleted, OnGlobalQueueFailed, Process, Processor } from '@nestjs/bull';

import printConfig from 'src/config/print.config';

import { PrintJob, PrintJobOutput } from './lib';


@Injectable()
export class PrintService/* implements OnModuleDestroy*/ {

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @InjectQueue('print') private readonly queue: Queue<PrintJob>
  ) {}

  async print(templatePath: string, fillData?: Record<string, any>) {
    const token = uuidv4();

    // await new Promise<void>(async (resolve, reject) => {
    //   // Prepare listeners before adding a job to register them faster
    //   const onCompleted: CompletedEventCallback<PrintJob> = (completedJob: Job<PrintJob>, result: PrintJobOutput) => {
    //     if (completedJob.id === token) {
    //       console.log('completed', 'pid:', process.pid);
    //       if (result.path) {
    //         resolve();
    //       } else {
    //         reject(new Error('No output from the print job'));
    //       }
    //       this.queue.removeListener('completed', onCompleted);
    //       this.queue.removeListener('failed', onFailed);
    //       console.log('listeners removed');
    //     }
    //   };
    //   const onFailed: FailedEventCallback<PrintJob> = (failedJob: Job<PrintJob>, reason: Error) => {
    //     if (failedJob.id === token) {
    //       reject(reason);
    //       this.queue.removeListener('failed', onFailed);
    //       this.queue.removeListener('completed', onCompleted);
    //       console.log('listeners removed');
    //     }
    //   };

    //   console.log('adding the job...', 'pid:', process.pid);
    //   await this.queue.add('print', {
    //     templatePath,
    //     fillData
    //   }, {
    //     jobId: token,  // assign custom JobID which we also return to a user so they can refer to it to retrieve a result
    //     timeout: this.config.printJob.timeout
    //   });

    //   this.queue.addListener('completed', onCompleted);
    //   this.queue.addListener('failed', onFailed);
    // });

    console.log('adding the job...', 'pid:', process.pid);
    await this.queue.add('print', {
      templatePath,
      fillData
    }, {
      jobId: token,  // assign custom JobID which we also return to a user so they can refer to it to retrieve a result
      timeout: this.config.printJob.timeout,
      attempts: 5  // LibreOffice (soffice) can be run in parallel only in limited number of instances, otherwise it will fail, so we add a few attempts to help it do the job
    });

    return { token };
  }


  async getPrintOutput(token: string): Promise<[string, string]> {
    const job = await this.queue.getJob(token);
    if (job) {
      console.log('/tmp contents', fs.readdirSync('/tmp'));
      console.log('getting PDF', job.returnvalue?.path, fs.statSync(job.returnvalue?.path));
      return [
        job.returnvalue?.path,
        path.basename(job.data.templatePath, path.extname(job.data.templatePath)) + '.pdf'
      ];
    } else {
      throw new NotFoundException('No job found for the given token');
    }
  }

}



@Processor('print')
export class PrintQueueConsumer {

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @InjectQueue('print') private readonly queue: Queue
  ) {
    // From docs: "Bull is smart enough not to add the same repeatable job if the repeat options are the same"
    // (i.e. it will be "added" but no duplicates will be planted)
    queue.add('purge-queue', null, {
      repeat: { every: config.purgeQueueJob.repeatEvery },
      removeOnComplete: true
    });
  }

  // @OnGlobalQueueError()
  // onGlobalQueueError(error: Error) {
  //   console.error('pid:', process.pid, error);
  // }

  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any) {  // result: string for print job
    const job = await this.queue.getJob(jobId);
    if (job?.id) {
      // TODO: notify the client here
      console.log('(Global) on completed: job ', job);
    }
  }

  @OnGlobalQueueFailed()
  async onGlobalFailed(jobId: number, result: any) {
    const job = await this.queue.getJob(jobId);
    // TODO: notify the client here
    // console.log('(Global) on failed: job ', job);
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
