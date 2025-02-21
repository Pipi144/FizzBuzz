import { baseAddress } from "@/baseAddress";
import {
  TAddGameAttemptPayload,
  TCheckAnswerPayload,
  TGameAttempt,
} from "@/models/gameAttempt";
import { TGameQuestion } from "@/models/gameQuestion";
import { TServerError } from "@/models/ServerErrorRespond";
import axios, { AxiosError } from "axios";

export const getGameAttemptApi = async (attemptId: string) => {
  try {
    const res = await axios.get<TGameAttempt>(
      `${baseAddress}/api/game-attempt/${attemptId}`
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

export const createGameAttemptApi = async (payload: TAddGameAttemptPayload) => {
  try {
    const res = await axios.post<TGameAttempt>(
      `${baseAddress}/api/game-attempt`,
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

export const generateGameQuestionApi = async (gameAttemptId: string) => {
  try {
    const res = await axios.get<TGameQuestion>(
      `${baseAddress}/api/game-attempt/generate-question/${gameAttemptId}`
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

export const checkAnswerApi = async (payload: TCheckAnswerPayload) => {
  try {
    const res = await axios.post<TGameQuestion>(
      `${baseAddress}/api/game-attempt/check`,
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
