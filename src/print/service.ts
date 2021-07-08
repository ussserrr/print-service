import * as path from 'path';
import * as fs from 'fs';

import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { Observable, fromEventPattern, merge, from } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import printConfig, { PRINT_JOB_NAME, PRINT_QUEUE_NAME } from 'src/config/print.config';
import { OwnerDescription } from 'src/template-types/entities/entity';
import appConfig from 'src/config/app.config';
import { PrintJob } from './lib';


type DoneMessage = {
  token: string;
  error?: string;
}


@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);

  constructor(
    @Inject(printConfig.KEY) private config: ConfigType<typeof printConfig>,
    @Inject(appConfig.KEY) private configApp: ConfigType<typeof appConfig>,
    @InjectQueue(PRINT_QUEUE_NAME) private readonly queue: Queue<PrintJob>
  ) {}


  listenForJobs(userId: number): Observable<DoneMessage> {
    const listeners = ['completed', 'failed'].map(eventType => fromEventPattern(
      handler => {
        this.queue.addListener('global:' + eventType, handler);
        this.logger.debug(`UserID ${userId} requested a listener for the "${eventType}" event`);
      },
      handler => {
        this.queue.removeListener('global:' + eventType, handler);
        this.logger.debug(`UserID ${userId} disconnected from the "${eventType}" listener`);
      }
    ));

    const observable = merge(...listeners).pipe(
      mergeMap(([ jobId, ]: [ number, ]) => {
        const jobPromise = this.queue.getJob(jobId);
        return from(jobPromise);
      }),
      filter(job =>
        job?.name === PRINT_JOB_NAME &&
        job.data.userId === userId
      ),
      map((job: Job<PrintJob>) => ({  // prepare the result to consume by the controller
        token: job.id as string,
        error: job.returnvalue?.path
          // "failedReason" can actually be present even if a "returnvalue" is defined
          // (e.g. after several attempts)
          ? undefined
          // Warning! Exposes internal details
          : job.failedReason
      }))
    );

    return observable;
  }


  async print(templatePath: string, userId: number, fillData?: Record<string, any>) {
    const token = uuidv4();

    await this.queue.add(PRINT_JOB_NAME, { templatePath, userId, fillData }, {
      jobId: token,  // assign custom JobID which we also return to a user so they can refer to it to retrieve a result
      timeout: this.config.printJob.timeoutMs,
      attempts: 5  // LibreOffice (soffice) can be run in parallel only in limited number of instances, otherwise it will fail, so we add a few attempts to help it do the job
    });

    return { token };
  }


  async getPrintOutput(token: string): Promise<[string, string]> {
    const job = await this.queue.getJob(token);
    if (job) {
      console.log('/tmp contents', fs.readdirSync('/tmp'));  // TODO
      console.log('getting PDF', job.returnvalue?.path, fs.statSync(job.returnvalue?.path));  // TODO
      return [
        job.returnvalue?.path,
        path.basename(job.data.templatePath, path.extname(job.data.templatePath)) + '.pdf'
      ];
    } else {
      throw new NotFoundException('No job found for the given token');
    }
  }


  async getConfig() {
    return _.merge(
      _.pick(this.configApp, 'filesToKeep', 'allowedFileTypes'),
      _.pick(this.config, 'printJob'),
      {
        owners: Object.entries(OwnerDescription).map(([key, description]) => ({
          id: key, label: description
        }))
      }
    );
  }

}
