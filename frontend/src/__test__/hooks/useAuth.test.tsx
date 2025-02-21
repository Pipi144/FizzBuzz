import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { TUser } from "@/models/user";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import {
  mockAuthServerError,
  validAuthPayload,
} from "@/__mocks__/authHandlers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});
const wrapper = createReactQueryWrapper(queryClient);

const mockReturnedUser: TUser = {
  userId: "123",
  username: "validUser",
};

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it("should call onSuccessLogin when login succeeds", async () => {
    const onSuccessLogin = jest.fn();
    const { result } = renderHook(
      () => useAuth({ loginProps: { onSuccessLogin } }),
      {
        wrapper,
      }
    );

    act(() => {
      result.current.login.mutate(validAuthPayload);
    });

    await waitFor(() => expect(result.current.login.isSuccess).toBe(true));

    expect(onSuccessLogin).toHaveBeenCalledWith(mockReturnedUser);
  });

  it("should call onErrorLogin when login fails", async () => {
    const onErrorLogin = jest.fn();
    const { result } = renderHook(
      () => useAuth({ loginProps: { onErrorLogin } }),
      {
        wrapper,
      }
    );

    act(() => {
      result.current.login.mutate({
        username: "wrongUsername",
        password: "wrong",
      });
    });

    await waitFor(() => expect(result.current.login.isError).toBe(true));

    expect(onErrorLogin).toHaveBeenCalledWith(mockAuthServerError);
  });

  it("should call onSuccessRegister when register succeeds", async () => {
    const onSuccessRegister = jest.fn();
    const { result } = renderHook(
      () => useAuth({ registerProps: { onSuccessRegister } }),
      {
        wrapper,
      }
    );

    act(() => {
      result.current.register.mutate(validAuthPayload);
    });

    await waitFor(() => expect(result.current.register.isSuccess).toBe(true));

    expect(onSuccessRegister).toHaveBeenCalledWith(mockReturnedUser);
  });

  it("should call onErrorRegister when register fails", async () => {
    const onErrorRegister = jest.fn();
    const { result } = renderHook(
      () => useAuth({ registerProps: { onErrorRegister } }),
      {
        wrapper,
      }
    );

    act(() => {
      result.current.register.mutate({
        ...validAuthPayload,
        username: "wrong username",
      });
    });
    await waitFor(() => expect(result.current.register.isError).toBe(true));

    expect(onErrorRegister).toHaveBeenCalledWith(mockAuthServerError);
  });
});
