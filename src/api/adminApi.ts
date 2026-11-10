import adminStatsApi from "./adminStatsApi";
import adminProductApi from "./adminProductApi";
import adminOrderApi from "./adminOrderApi";
import adminCategoryApi from "./adminCategoryApi";
import adminBrandApi from "./adminBrandApi";
import adminUserApi from "./adminUserApi";
import adminPaymentApi from "./adminPaymentApi";
import mediaApi from "./mediaApi";
import profileApi from "./profileApi";

export {
  adminStatsApi,
  adminProductApi,
  adminOrderApi,
  adminCategoryApi,
  adminBrandApi,
  adminUserApi,
  adminPaymentApi,
  mediaApi,
  profileApi,
};

export const adminApi = {
  ...adminStatsApi,
  ...adminProductApi,
  ...adminOrderApi,
  ...adminCategoryApi,
  ...adminBrandApi,
  ...adminUserApi,
  ...adminPaymentApi,
  ...mediaApi,
  ...profileApi,
};

export default adminApi;
