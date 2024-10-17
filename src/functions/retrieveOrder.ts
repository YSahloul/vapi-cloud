import { Client, Environment } from 'square';

interface Bindings {
  SQUARE_ACCESS_TOKEN: string;
  SQUARE_LOCATION_ID: string;
}

export async function retrieveOrder(bindings: Bindings, orderId: string) {
  const client = new Client({
    accessToken: bindings.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  try {
    const response = await client.ordersApi.retrieveOrder(orderId);
    
    if (response.result.order) {
      return {
        success: true,
        order: response.result.order
      };
    } else {
      return {
        success: false,
        error: 'Order not found'
      };
    }
  } catch (error) {
    console.error('Error retrieving order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

