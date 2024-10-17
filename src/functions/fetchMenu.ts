import { Client, Environment } from 'square';
import { Bindings } from '../types/hono.types';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  variationId: string;
}

export async function fetchMenu(bindings: Bindings): Promise<MenuItem[]> {
  if (!bindings.SQUARE_ACCESS_TOKEN) {
    console.log('SQUARE_ACCESS_TOKEN is not set in the environment variables');
    return [];
  }

  const client = new Client({
    accessToken: bindings.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox, // or Environment.Production based on your setup
  });

  try {
    console.log('Fetching menu from Square...');
    const response = await client.catalogApi.listCatalog(undefined, 'ITEM');
    
    const menuItems: MenuItem[] = response.result.objects
      ?.filter((item: any) => item.type === 'ITEM')
      .map((item: any) => ({
        id: item.id,
        name: item.itemData?.name ?? '',
        description: item.itemData?.description ?? '',
        price: (item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount ?? 0).toString(),
        variationId: item.itemData?.variations?.[0]?.id ?? '',
      })) ?? [];

    console.log(`Fetched ${menuItems.length} menu items`);
    console.log('Menu items:', JSON.stringify(menuItems, null, 2));
    return menuItems;
  } catch (error) {
    console.error('Error fetching menu from Square:', error);
    return [];
  }
}
