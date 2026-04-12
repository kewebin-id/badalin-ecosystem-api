import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPaymentRepository } from '../ports/payment.repository.port';

@Injectable()
export class PaymentScheduler {
  private readonly logger = new Logger(PaymentScheduler.name);

  constructor(
    @Inject('IPaymentRepository')
    private readonly repository: IPaymentRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoCancel() {
    this.logger.log('Running auto-cancel check for transactions...');

    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

    const transactionsToCancel = await this.repository.findToCancel(seventyTwoHoursAgo);

    for (const tx of transactionsToCancel) {
      await this.repository.cancelTransaction(tx.id);
      this.logger.log(`Transaction ${tx.id} auto-cancelled.`);
    }
  }
}
