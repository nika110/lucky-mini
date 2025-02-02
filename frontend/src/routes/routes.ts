export enum ROUTES {
  HOME = "/",
  WALLET = "/wallet",
  GAMES = "/games",
  LEADERS = "/leaders",
  REFERRAL = "/referral",
  SIGN_SOL = "/sign-sol",
  CONNECT_SOL = "/connect-sol",
  LUCKY_TAP = "/luckytap",
  LUCKY_31 = "/lucky31",
}

export type RouteKeys = keyof typeof ROUTES;
