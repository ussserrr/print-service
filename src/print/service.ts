import * as path from 'path';
import * as fs from 'fs';

import * as _ from 'lodash';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { Job, Queue } from 'bull';
import { InjectQueue, OnGlobalQueueCompleted, OnGlobalQueueFailed, Process, Processor } from '@nestjs/bull';

import printConfig from 'src/config/print.config';
import appConfig from 'src/config/app.config';

import { PrintJob } from './lib';
import { Observable, fromEventPattern, merge, from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { OwnerDescription } from 'src/template-types/entities/entity';


@Injectable()
export class PrintService {

  constructor(
    @Inject(printConfig.KEY) private configPrint: ConfigType<typeof printConfig>,
    @Inject(appConfig.KEY) private configApp: ConfigType<typeof appConfig>,
    @InjectQueue('print') private readonly queue: Queue<PrintJob>
  ) {}


  getObservable(userId: number): Observable<Job<PrintJob>> {
    const listeners = ['completed', 'failed'].map(eventType => fromEventPattern(
      handler => {
        this.queue.addListener('global:' + eventType, handler);
        console.log(eventType + ' listener added');
      },
      handler => {
        this.queue.removeListener('global:' + eventType, handler);
        console.log(eventType + ' listener removed');
      }
    ));

    const observable = merge(...listeners).pipe(
      mergeMap((eventArgs: [string,]) => from(this.queue.getJob(eventArgs[0]))),
      filter(job =>
        job?.name === 'print'
        && job.data.userId === userId
      )
    );

    return observable as Observable<Job<PrintJob>>;
  }


  async print(templatePath: string, userId: number, fillData?: Record<string, any>) {
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
    await this.queue.add('print', { templatePath, userId, fillData }, {
      jobId: token,  // assign custom JobID which we also return to a user so they can refer to it to retrieve a result
      timeout: this.configPrint.printJob.timeoutMs,
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


  async getConfig() {
    // await new Promise(resolve => setTimeout(resolve, 10000));
    return _.merge(
      _.pick(this.configApp, 'filesToKeep', 'allowedFileTypes'),
      _.pick(this.configPrint, 'printJob'),
      {
        owners: Object.entries(OwnerDescription).map(([key, description]) => ({
          id: key, label: description
        }))
      }
    );
  }

}



// TODO: get out from service? (e.g. queue.ts)
@Processor('print')
export class PrintQueueConsumer {

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @InjectQueue('print') private readonly queue: Queue
  ) {
    queue.getFailed()
      .then(failedJobs => failedJobs.filter(job =>
        job.name === 'purge-queue' &&
        job.failedReason === ('Missing process handler for job type ' + 'purge-queue')
      ))
      .then(purgeQueueFailedJobs => Promise.all(purgeQueueFailedJobs.map(job => {
        console.log('failed purge-queue job', job.id);
        return job.remove();
      })))
      // From docs: "Bull is smart enough not to add the same repeatable job if the repeat options are the same"
      // (i.e. it will be "added" but no duplicates will be planted, even on multiple instances)
      .then(() => queue.add('purge-queue', null, {
        repeat: { every: config.purgeQueueJob.repeatEvery },
        removeOnComplete: true
      }));

    // queue.add('purge-queue', null, {
    //   repeat: { every: config.purgeQueueJob.repeatEvery },
    //   removeOnComplete: true
    // });
  }

  // @OnGlobalQueueError()
  // onGlobalQueueError(error: Error) {
  //   console.error('pid:', process.pid, error);
  // }

  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any) {  // result: string for print job
    const job = await this.queue.getJob(jobId);
    // console.log('(Global) on completed: job', jobId);
    if (
      job?.name === 'print' &&
      typeof job.returnvalue?.path === 'string' && job.returnvalue.path.length
    ) {
      console.log('(Global) on completed: job', job);
    }
  }

  @OnGlobalQueueFailed()
  async onGlobalFailed(jobId: number, result: any) {
    const job = await this.queue.getJob(jobId);
    // console.log('(Global) on failed: job ', job);
  }


  @Process('purge-queue')
  async purgeQueue(job: Job) {
    console.log('purge-queue job is started, pid:', process.pid);
    const completedJobs = await this.queue.getCompleted();
    await Promise.all(completedJobs
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
