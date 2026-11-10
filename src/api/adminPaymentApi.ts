import axiosClient from "./axiosClient";
import {
  AdminProcessTransactionRequest,
  ApiResponse,
  PageResponse,
  SePayTransactionResponse,
  SePayTransactionStatus,
} from "@/types";

export const adminPaymentApi = {
  /**
   * Lấy danh sách giao dịch chuyển khoản VietQR SePay
   */
  async getTransactions(
    status?: SePayTransactionStatus | string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<SePayTransactionResponse>>> {
    const params: Record<string, string | number> = { page, size };
    if (status && status !== "ALL") {
      params.status = status;
    }

    const response = await axiosClient.get<ApiResponse<PageResponse<SePayTransactionResponse>>>(
      "/api/v1/admin/payments/transactions",
      { params }
    );
    return response.data;
  },

  /**
   * Admin xử lý thủ công giao dịch chuyển khoản (gán mã đơn, đối soát khi khách chuyển sai cú pháp)
   */
  async processTransaction(
    id: string,
    payload: AdminProcessTransactionRequest
  ): Promise<ApiResponse<SePayTransactionResponse>> {
    const response = await axiosClient.patch<ApiResponse<SePayTransactionResponse>>(
      `/api/v1/admin/payments/transactions/${id}/process`,
      payload
    );
    return response.data;
  },
};

export default adminPaymentApi;
