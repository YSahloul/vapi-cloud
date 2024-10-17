import { Client, Environment } from 'square';
import { createPayment } from './createPayment';
import { Bindings } from '../types/hono.types';

// Helper function to format money
function formatMoney(amount: number | bigint | null | undefined): string {
  if (amount == null) return 'Price not available';
  return `$${(Number(amount) / 100).toFixed(2)}`;
}

interface OrderItem {
  catalogObjectId: string;
  quantity: string;
}

interface OrderArgs {
  items: OrderItem[];
}

// Custom JSON serializer to handle BigInt
const jsonSerializer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export async function createOrder(bindings: Bindings, args: string | OrderArgs) {
  console.log('createOrder function called with args:', args);
  
  const client = new Client({
    accessToken: bindings.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox,
  });

  try {
    let items: OrderItem[];
    if (typeof args === 'string') {
      const parsedArgs = JSON.parse(args) as OrderArgs;
      items = parsedArgs.items;
    } else if (typeof args === 'object' && args !== null && Array.isArray(args.items)) {
      items = args.items;
    } else {
      throw new Error('Invalid arguments type or structure');
    }

    console.log('Parsed items:', items);

    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    console.log('Calling Square API to create order');
    const response = await client.ordersApi.createOrder({
      order: {
        locationId: bindings.SQUARE_LOCATION_ID,
        lineItems: items.map(item => ({
          catalogObjectId: item.catalogObjectId,
          quantity: item.quantity,
        })),
      },
    });
    console.log('Square API response:', JSON.stringify(response, jsonSerializer, 2));

    const order = response.result.order;
    if (!order || !order.id) {
      throw new Error('Order creation failed: No order returned or order ID is missing');
    }

    // Create payment for the order
    const totalAmount = order.totalMoney?.amount;
    let paymentResult = null;
    if (totalAmount != null) {
      console.log('Creating payment for order');
      paymentResult = await createPayment(bindings, order.id, Number(totalAmount));
      console.log('Payment result:', JSON.stringify(paymentResult, jsonSerializer, 2));

      if (!paymentResult.success) {
        console.error('Payment creation failed:', paymentResult.error);
      }
    } else {
      console.error('Unable to create payment: Total amount is null');
    }

    const formattedResponse = {
      success: true,
      orderId: order.id,
      items: order.lineItems?.map(item => ({
        name: item.name ?? 'Unknown Item',
        quantity: item.quantity ?? '0',
        price: formatMoney(item.totalMoney?.amount)
      })) ?? [],
      totalAmount: formatMoney(order.totalMoney?.amount),
      paymentStatus: paymentResult?.success ? paymentResult.status : 'Payment creation failed'
    };

    console.log('Formatted response:', JSON.stringify(formattedResponse, jsonSerializer, 2));
    return formattedResponse;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order. Please try again.'
    };
  }
}
