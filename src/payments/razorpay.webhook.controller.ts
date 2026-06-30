import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { EscrowPaymentService } from './escrow-payment.service';
import { RazorpayService } from './razorpay.service';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_ORDER_PURPOSES } from './constants';

@ApiTags('Webhooks')
@ApiExcludeController()
@Controller('webhooks')
export class RazorpayWebhookController {
  constructor(
    private readonly razorpay: RazorpayService,
    private readonly wallet: WalletService,
    private readonly escrowPayment: EscrowPaymentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('razorpay')
  @ApiOperation({ summary: 'Razorpay payment webhook' })
  async handleWebhook(
    @Req() req: { rawBody?: Buffer; body?: Record<string, unknown> },
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: Record<string, unknown>,
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    if (!this.razorpay.verifyWebhookSignature(rawBody, signature)) {
      return { success: false, message: 'Invalid signature' };
    }

    const event = body.event as string;
    const payload = body.payload as Record<string, { entity: Record<string, string> }>;

    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      if (orderId && paymentId) {
        const order = await this.prisma.paymentOrder.findUnique({
          where: { razorpay_order_id: orderId },
        });
        if (order && order.status !== 'PAID') {
          if (order.purpose === PAYMENT_ORDER_PURPOSES.ESCROW_FUND) {
            await this.escrowPayment.fundEscrowFromWebhook(orderId, paymentId);
          } else {
            await this.wallet.verifyAndCredit(order.user_id, {
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature,
            });
          }
        }
      }
    }

    if (event === 'payment.failed') {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      if (orderId) {
        await this.prisma.paymentOrder.updateMany({
          where: { razorpay_order_id: orderId, status: 'CREATED' },
          data: { status: 'FAILED' },
        });
      }
    }

    return { success: true };
  }
}
