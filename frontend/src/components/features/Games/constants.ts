import { ROUTES } from "@/routes/routes";

export type CassetteGame = {
  id: number;
  name: string;
  link: string;
}

export const cassetteGames: CassetteGame[] = [
  {
    id: 1,
    name: 'lucky TAP',
    link: ROUTES.LUCKY_TAP
  },
  {
    id: 2,
    name: 'lucky 31',
    link: ROUTES.LUCKY_31
  },
];