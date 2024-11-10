export enum ROUTES {
  HOME = "/",
  WALLET = "/wallet",
  LEADERS = "/leaders",
  REFERRAL = "/referral",
  SIGN_SOL = "/sign-sol",
  CONNECT_SOL = "/connect-sol",
}

export type RouteKeys = keyof typeof ROUTES;
