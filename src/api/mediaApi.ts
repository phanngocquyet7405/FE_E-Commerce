import axiosClient from "./axiosClient";
import { ApiResponse, MediaUploadResponse } from "@/types";

export const mediaApi = {
  /**
   * Tải 1 ảnh lên máy chủ / Cloudinary
   */
  async uploadFile(file: File): Promise<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiResponse<MediaUploadResponse>>(
      "/api/v1/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Tải nhiều ảnh lên Cloudinary cùng lúc (dùng cho gallery sản phẩm)
   */
  async uploadMultipleFiles(
    files: File[]
  ): Promise<ApiResponse<MediaUploadResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await axiosClient.post<ApiResponse<MediaUploadResponse[]>>(
      "/api/v1/media/upload-multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default mediaApi;
