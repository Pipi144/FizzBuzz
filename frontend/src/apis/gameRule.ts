import { baseAddress } from "@/baseAddress";

import {
  TAddGameRulePayload,
  TGameRule,
  TUpdateGameRulePayload,
} from "@/models/gameRule";
import { TServerError } from "@/models/ServerErrorRespond";
import { removeFalsyProps } from "@/utils/helperFncs";
import axios, { AxiosError } from "axios";

export const editGameRuleApi = async (payload: TUpdateGameRulePayload) => {
  try {
    const { ruleId, ...rest } = payload;
    const res = await axios.patch<TGameRule>(
      `${baseAddress}/api/GameRule/${ruleId}`,
      removeFalsyProps(rest)
    );

    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data;
    }

    throw error;
  }
};

export const addGameRuleApi = async (payload: TAddGameRulePayload) => {
  try {
    const res = await axios.post<TGameRule>(
      `${baseAddress}/api/GameRule`,
      payload
    );

    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data;
    }

    throw error;
  }
};

export const deleteGameRuleApi = async (ruleId: string) => {
  try {
    await axios.delete(`${baseAddress}/api/GameRule/${ruleId}`);
  } catch (error) {
    const axiosError = error as AxiosError<TServerError>;

    if (axiosError.response?.data) {
      throw axiosError.response.data;
    }

    throw error;
  }
};
