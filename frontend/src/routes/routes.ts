export enum ROUTES {
  HOME = "/",
  WALLET = "/wallet",
  LEADERS = "/leaders",
  REFERRAL = "/referral",
  CONNECT_SOL = "/connect-sol",
}

export type RouteKeys = keyof typeof ROUTES;
