import {
  API_ENDPOINTS,
  parseApiResponse,
  publicApiClient,
} from "@/services/api";

import {
  customerCategoriesSchema,
  customerMenuItemsSchema,
  customerOrderSchema,
} from "../schemas/customerOrderingSchemas";
import type {
  CustomerMenuData,
  CustomerMenuItem,
  PlaceCustomerOrderInput,
  TrackCustomerOrderInput,
} from "../types/customerOrdering.types";

export const getCustomerMenu = async (
  signal?: AbortSignal
): Promise<CustomerMenuData> => {
  const requestConfig = signal ? { signal } : undefined;
  const [categoriesResponse, menuResponse] = await Promise.all([
    publicApiClient.get<unknown>(API_ENDPOINTS.categories, requestConfig),
    publicApiClient.get<unknown>(API_ENDPOINTS.menu, requestConfig),
  ]);
  const categories = parseApiResponse(
    customerCategoriesSchema,
    categoriesResponse.data
  ).sort((left, right) => left.displayOrder - right.displayOrder);
  const menuItems = parseApiResponse(
    customerMenuItemsSchema,
    menuResponse.data
  )
    .filter((item) => item.isAvailable)
    .map(
      (item): CustomerMenuItem => ({
        categoryId: item.categoryId,
        description: item.description,
        id: item.id,
        imageUrl: item.imageUrl,
        name: item.name,
        prepTimeMinutes: item.prepTimeMinutes,
        price: item.price,
      })
    );

  return {
    categories,
    menuItems,
  };
};

export const placeCustomerOrder = async ({
  items,
  tableNumber,
}: PlaceCustomerOrderInput) => {
  const response = await publicApiClient.post<unknown>(
    API_ENDPOINTS.orders,
    { items, tableNumber }
  );

  return parseApiResponse(customerOrderSchema, response.data);
};

export const trackCustomerOrder = async ({
  orderId,
  tableNumber,
}: TrackCustomerOrderInput) => {
  const response = await publicApiClient.get<unknown>(
    `${API_ENDPOINTS.orders}/${orderId}/track`,
    { params: { tableNumber } }
  );

  return parseApiResponse(customerOrderSchema, response.data);
};
