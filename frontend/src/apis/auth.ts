import { baseAddress } from "@/baseAddress";
import { TAuthPayload } from "@/models/AuthModels";
import { TServerError } from "@/models/ServerErrorRespond";
import { TUser } from "@/models/user";
import axios, { AxiosError } from "axios";
export const loginApi = async (payload: TAuthPayload) => {
  try {
    const res = await axios.post<TUser>(
      `${baseAddress}/api/User/login`,
      payload
    );
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data; // ✅ Convert to `ServerError`
    }

    throw error;
  }
};

export const registerApi = async (payload: TAuthPayload) => {
  try {
    const res = await axios.post<TUser>(`${baseAddress}/api/User`, payload);
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data; // ✅ Convert to `ServerError`
    }

    throw error;
  }
};
