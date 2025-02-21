export type TServerError = {
  statusCode: number;
  message: string;
  detailed: string | null;
  type: string;
};
