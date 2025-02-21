import { ZodIssue } from "zod";

export const findErrors = (fieldName: string, errors: ZodIssue[]) => {
  return (errors ?? [])
    .filter((item) => {
      return item.path.includes(fieldName);
    })
    .map((item) => item.message);
};
/* eslint-disable @typescript-eslint/no-unused-vars */
export const removeFalsyProps = <T extends Record<string, unknown>>(
  obj: T
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) =>
        Boolean(value !== undefined) && value !== null && value !== ""
    )
  ) as Partial<T>;
};
