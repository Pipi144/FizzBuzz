import { NextResponse, type NextRequest } from "next/server";
import { COOKIES_KEYS } from "./utils/cookies";
import AppRoutes from "./RoutePaths";

export function middleware(rq: NextRequest) {
  // check user detail in cookies if it is valid
  const cookieUser = rq.cookies.get(COOKIES_KEYS.CurrentUser);
  // redirect to login page if accessing authorized pages without access token

  if (
    (rq.nextUrl.pathname === AppRoutes.Login ||
      rq.nextUrl.pathname === AppRoutes.Register) &&
    cookieUser
  )
    return NextResponse.redirect(new URL(AppRoutes.Home, rq.url));
  if (rq.nextUrl.pathname.includes(AppRoutes.Game) && !cookieUser)
    return NextResponse.redirect(new URL(AppRoutes.Login, rq.url));
  return NextResponse.next();
}
