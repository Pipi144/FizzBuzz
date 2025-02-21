export type TAuthState = {
  userName: string;
  password: string;
  userNameErrors?: string[];
  passwordErrors?: string[];
  serverErrors?: string[];
  success?: boolean;
};

export type TAuthPayload = {
  username: string;
  password: string;
};
