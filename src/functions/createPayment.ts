import { Client, Environment } from 'square';

interface Bindings {
  SQUARE_ACCESS_TOKEN: string;
  SQUARE_LOCATION_ID: string;
}

export async function createPayment(bindings: Bindings, orderId: string, amount: number) {
  const client = new Client({
    accessToken: bindings.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  try {
    const response = await client.paymentsApi.createPayment({
      sourceId: 'EXTERNAL',
      idempotencyKey: new Date().toISOString(),
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD'
      },
      orderId: orderId,
      locationId: bindings.SQUARE_LOCATION_ID,
      externalDetails: {
        type: 'EXTERNAL',
        source: 'CUSTOM_PAYMENT_FLOW',
        sourceId: 'CUSTOM_PAYMENT_FLOW_ID',
        sourceFeeMoney: {
          amount: BigInt(0),
          currency: 'USD'
        }
      }
    });

    if (response.result.payment) {
      return {
        success: true,
        paymentId: response.result.payment.id,
        status: response.result.payment.status
      };
    } else {
      return {
        success: false,
        error: 'Failed to create payment'
      };
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}