/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from "react";
// import cl from "./MainGame.module.css";
import NumberFormatter from "@/components/shared/NumberFormatter/NumberFormatter";
import { Button } from "@/components/shared/UI/button";
import { Chip } from "@/components/shared/UI/Icons/Chip";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { Copy } from "@/components/shared/UI/Icons/Copy";
import { formatNumber } from "@/helpers/formatCount";
import { LOCAL_STORAGE_KEYS } from "@/utils/localStorage";
import {
  useGetUserQuery,
  useInitializeUserMutation,
} from "@/redux/services/user.api";
import bs58 from "bs58";
import { AppInitParams } from "@/types/user";

const MainGame: FC = () => {
  const [prizePool] = useState(134567);

  const isInitLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.TG_INIT_USER);
  const [initializeUser] = useInitializeUserMutation();

  useGetUserQuery(window.Telegram!.WebApp!.initDataUnsafe!.user!.id!, {
    skip: !isInitLocal || !window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
  });

  useEffect(() => {
    const initUserMut = (
      userId: number,
      userInitials: string,
      referralCode?: string
    ) => {
      const body: {
        telegramId: string;
        username?: string;
        referralCode?: string;
      } = {
        telegramId: userId.toString(),
        username: userInitials,
      };
      if (referralCode) {
        body.referralCode = referralCode;
      }
      initializeUser(body)
        .then((res) => {
          if (res.data && "success" in res.data && res.data.success) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TG_INIT_USER, "true");
          }
        })
        .catch(() => {
          // alert(JSON.stringify(error));
        });
    };

    const isInit = localStorage.getItem(LOCAL_STORAGE_KEYS.TG_INIT_USER);
    const tgUserInfo = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!isInit && isInit !== "true" && tgUserInfo) {
      const userId = tgUserInfo.id;
      const userInitials =
        `${tgUserInfo.first_name} ${tgUserInfo.last_name}`.trim();
      const startParams = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (startParams) {
        try {
          const dataFromStartParam: AppInitParams = JSON.parse(
            Buffer.from(bs58.decode(startParams))
              .toString("utf8")
              .replace(/^'|'$/g, "")
          );
          if (dataFromStartParam.referralCode)
            initUserMut(userId, userInitials, dataFromStartParam.referralCode);
        } catch (error) {
          // do smth
        }
      } else {
        initUserMut(userId, userInitials);
      }
    }
  }, [initializeUser]);

  return (
    <section className={"pt-16"}>
      <div className="container">
        {/* PRIZE POOL */}
        <h1 className="text-xl text-center uppercase mb-4">prize pool:</h1>
        <div className="relative flex justify-center">
          <span className="inline-block text-2xl leading-none uppercase">
            <span className="text-dim">$</span>
            <span className="relative text-white">
              <NumberFormatter value={prizePool} />
              <span className="inline-block text-white bg-marigold absolute bottom-[-2px] right-0 left-[4px] w-[calc(100%-8px)] h-[2px]" />
            </span>
          </span>
        </div>

        {/* TIME REMAINING */}
        <div className="flex mt-8 flex-col justify-center items-center gap-3.5">
          <h2 className="text-base uppercase text-center leading-3">
            time remaining:
          </h2>
          <span className="text-center text-[20px] uppercase leading-none">
            {/* HOURS */}
            <span>23</span>
            <span className="text-dim">H</span>
            &nbsp;
            {/* MINUTES */}
            <span>30</span>
            <span className="text-dim">M</span>
            &nbsp;
            {/* SECONDS */}
            <span>15</span>
            <span className="text-dim">S</span>
          </span>
        </div>

        {/* BUY TICKETS */}
        <div className="grid px-3.5 grid-cols-2 mt-14 justify-center items-center gap-4">
          <Button>Buy Ticket</Button>
          <Button variant={"ghost"}>How it works</Button>
        </div>
        <a
          href="https://www.google.com"
          target="_blank"
          className="flex mt-3.5 justify-center items-center gap-1.5 text-magnet text-xs uppercase text-center transition-colors duration-150 active:text-white"
        >
          <span className="relative inline-block">
            <span className="relative inline-block">
              PROOF OF FAIRNES
              <span className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-liquor w-full" />
            </span>
            &nbsp; (FOR NERDS)
          </span>
          <Chip />
        </a>

        {/* PAST WINNERS */}
        <PastWinners />
      </div>
    </section>
  );
};

export const PastWinners: FC = () => {
  const [pastWinners, setPastWinners] = useState([
    {
      wallet: "0x041341312413212421321412321",
      prize: "4000000",
      percantage: "70%",
    },
    {
      wallet: "0x041341312413212421321412321",
      prize: "4000",
      percantage: "70%",
    },
    {
      wallet: "0x041341312413212421321412321",
      prize: "400000",
      percantage: "70%",
    },
    {
      wallet: "0x041341312413212421321412321",
      prize: "40000",
      percantage: "70%",
    },
    {
      wallet: "0x041341312413212421321412321",
      prize: "400000",
      percantage: "70%",
    },
  ]);
  return (
    <div className="relative mt-8">
      <PixelWrapper width={3} color="gray" />
      <div className="bg-inkwell pt-5 px-4 pb-4">
        <h2 className="uppercase text-base leading-none mb-3">PAST WINNERS:</h2>
        <div className="border-y-[1px] border-liquor py-1.5 flex justify-between items-center">
          <span className="text-magnet uppercase text-xs">wallet id</span>
          <span className="text-magnet uppercase text-xs">PRIZE</span>
        </div>
        <ul className="pt-3 flex flex-col gap-3">
          {pastWinners.map((winner, index) => (
            <li
              className="relative w-full flex justify-between items-center"
              key={index}
            >
              <span className="absolute left-0 right-0 top-0 bottom-0 z-[1] m-auto bg-liquor h-[1px]" />
              <div className="relative z-[2] bg-inkwell pr-3 flex justify-start items-center gap-2">
                <Copy />
                <span className="inline-block text-[10px] leading-none truncate max-w-[117px]">
                  {winner.wallet}
                </span>
              </div>
              <div className="relative z-[2] pl-3 bg-inkwell inline-flex justify-end items-center text-[10px]">
                <span className="text-dim">$</span>
                <span className="relative inline-block leading-none">
                  <span className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-marigold w-full" />
                  {formatNumber(+winner.prize)}
                </span>
                &nbsp;
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MainGame;
