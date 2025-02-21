import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";
import { TAuthPayload } from "@/models/AuthModels";
import { TServerError } from "@/models/ServerErrorRespond";
import { TUser } from "@/models/user";

export const validAuthPayload: TAuthPayload = {
  username: "validUser",
  password: "validPass",
};

export const mockAuthServerError: TServerError = {
  message: "Invalid credentials",
  statusCode: 401,
  detailed: "Invalid username or password",
  type: "Unauthorized",
};

export const mockedServerUser: TUser = {
  userId: "123",
  username: "validUser",
};
export const authHandlers = [
  // Mock the login API
  http.post(`${baseAddress}/api/User/login`, async ({ request }) => {
    const { username, password } = (await request.json()) as TAuthPayload;

    if (username === "validUser" && password === "validPass") {
      return HttpResponse.json(mockedServerUser, { status: 200 });
    }

    return HttpResponse.json(mockAuthServerError, { status: 401 });
  }),

  http.post(`${baseAddress}/api/User`, async ({ request }) => {
    const { username, password } = (await request.json()) as TAuthPayload;

    if (
      username === validAuthPayload.username &&
      password === validAuthPayload.password
    ) {
      return HttpResponse.json(mockedServerUser, { status: 200 });
    }

    return HttpResponse.json(mockAuthServerError, { status: 401 });
  }),
];
