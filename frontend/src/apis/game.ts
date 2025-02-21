import { baseAddress } from "@/baseAddress";
import {
  TAddGamePayload,
  TBasicGame,
  TGame,
  TGetGameParams,
  TUpdateGamePayload,
} from "@/models/game";
import { TServerError } from "@/models/ServerErrorRespond";
import { removeFalsyProps } from "@/utils/helperFncs";
import axios, { AxiosError } from "axios";

export const getGameListApi = async (filter?: TGetGameParams) => {
  try {
    const res = await axios.get<TBasicGame[]>(`${baseAddress}/api/Game`, {
      params: filter && removeFalsyProps(filter),
    });

    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data;
    }

    throw error;
  }
};

export const addGameApi = async (payload: TAddGamePayload) => {
  try {
    const res = await axios.post<TGame>(`${baseAddress}/api/Game`, payload);
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data;
    }

    throw error;
  }
};

export const getGameDetailApi = async (gameId: string) => {
  try {
    const res = await axios.get<TGame>(`${baseAddress}/api/Game/${gameId}`);
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data;
    }

    throw error;
  }
};

export const editGameApi = async (payload: TUpdateGamePayload) => {
  try {
    const { gameId, ...rest } = payload;
    const res = await axios.patch<TGame>(
      `${baseAddress}/api/Game/${gameId}`,
      removeFalsyProps(rest)
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
export const deleteGameApi = async (gameId: string) => {
  try {
    const res = await axios.delete(`${baseAddress}/api/Game/${gameId}`);
    return res;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data; // ✅ Convert to `ServerError`
    }

    throw error;
  }
};
