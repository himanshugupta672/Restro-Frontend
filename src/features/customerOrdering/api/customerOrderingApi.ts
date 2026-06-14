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

  if (import.meta.env.DEV) {
    console.log("[getCustomerMenu] Raw categories:", categoriesResponse.data);
    console.log("[getCustomerMenu] Raw menu items:", menuResponse.data);
  }

  // Parse and extract the array whether the backend wraps in $values or returns a plain array
  const rawCategories = unwrapCollection(categoriesResponse.data);
  const rawMenuItems = unwrapCollection(menuResponse.data);

  const categories = parseApiResponse(
    customerCategoriesSchema,
    rawCategories
  ).sort((left, right) => left.displayOrder - right.displayOrder);

  const menuItems = parseApiResponse(customerMenuItemsSchema, rawMenuItems)
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

  if (import.meta.env.DEV) {
    console.log("[placeCustomerOrder] Response:", response.data);
  }

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

  if (import.meta.env.DEV) {
    console.log("[trackCustomerOrder] Response:", response.data);
  }

  return parseApiResponse(customerOrderSchema, response.data);
};

/**
 * Some ASP.NET Core + EF Core serializers wrap collections in a `$values` array.
 * This helper extracts the actual array regardless of wrapper shape.
 */
function unwrapCollection(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;

    // Handle { $values: [...] } wrapper
    if (Array.isArray(record.$values)) {
      return record.$values;
    }

    // Handle { value: [...] } wrapper
    if (Array.isArray(record.value)) {
      return record.value;
    }

    // Handle { data: [...] } wrapper
    if (Array.isArray(record.data)) {
      return record.data;
    }

    // Handle { result: [...] } wrapper
    if (Array.isArray(record.result)) {
      return record.result;
    }
  }

  // Return as-is and let Zod validation catch the issue with a clear error
  return data;
}
