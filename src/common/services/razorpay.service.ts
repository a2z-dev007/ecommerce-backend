import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private static instance: Razorpay;

  private static getInstance() {
    if (!this.instance) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('Razorpay keys are missing in environment variables');
      }
      this.instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
      });
    }
    return this.instance;
  }

  public static async createOrder(amount: number, receipt: string, currency: string = 'INR') {
    const razorpay = this.getInstance();
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt,
    };

    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  public static verifySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}
