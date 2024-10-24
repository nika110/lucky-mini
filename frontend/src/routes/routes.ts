export enum ROUTES {
  HOME = "/",
  WALLET = "/wallet",
  LEADERS = "/leaders",
  REFERRAL = "/referral",
}

export type RouteKeys = keyof typeof ROUTES;
