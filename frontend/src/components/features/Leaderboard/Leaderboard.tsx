import { FC, useState } from "react";
import cl from "./Leaderboard.module.css";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { formatNumber } from "@/helpers/formatCount";
import { MedalIcon } from "@/components/shared/UI/Icons/MedalIcon";
import { TicketIcon } from "@/components/shared/UI/Icons/TicketIcon";

const Leaderboard: FC = () => {
  const [leaderboardList] = useState([
    {
      position: 1,
      wallet: "0x041341312413212421321412321",
      balance: 256154759,
    },
    {
      position: 2,
      wallet: "0x041341312413212421321412321",
      balance: 25615475,
    },
    {
      position: 3,
      wallet: "0x041341312413212421321412321",
      balance: 2561547,
    },
    {
      position: 4,
      wallet: "0x041341312413212421321412321",
      balance: 256154,
    },
    {
      position: 5,
      wallet: "0x041341312413212421321412321",
      balance: 25615,
    },
    {
      position: 6,
      wallet: "0x041341312413212421321412321",
      balance: 2561,
    },
    {
      position: 7,
      wallet: "0x041341312413212421321412321",
      balance: 256,
    },
  ]);

  return (
    <section className={`pt-12 ${cl.section}`}>
      <div className="container">
        <h1 className="text-xl text-center uppercase mb-4">Leaderboard</h1>
        <p className="text-center m-auto mb-9 uppercase text-base leading-[17px] text-rock">
          list is based on your XP (gained from purchasing tickets,{" "}
          <span className="relative text-white">
            1 ticket = 1000XP
            <span className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-marigold w-full" />
          </span>
          )
        </p>
        <div className="relative mb-4">
          <PixelWrapper width={3} color="gray" />
          <div className="bg-inkwell pt-3 px-4 pb-4">
            <div className="border-b-[1px] border-liquor py-1.5 flex justify-between items-center">
              <span className="text-magnet uppercase text-sm">wallet id</span>
              <span className="text-magnet uppercase text-sm">BALANCE</span>
            </div>
            <ul className="pt-3 flex flex-col gap-3">
              {leaderboardList.map((winner, index) => (
                <li
                  className="relative w-full flex justify-between items-center"
                  key={index}
                >
                  <span className="absolute left-0 right-0 top-0 bottom-0 z-[1] m-auto bg-liquor h-[1px]" />
                  <div className="relative z-[2] bg-inkwell pr-3 flex justify-start items-center gap-2">
                    <span className="relative w-5 h-5 flex justify-center items-center">
                      <MedalIcon
                        color={
                          winner.position === 1
                            ? "gold"
                            : winner.position === 2
                            ? "silver"
                            : winner.position === 3
                            ? "bronze"
                            : "gray"
                        }
                        className="w-5 h-5"
                      />
                      <span
                        className="flex justify-center items-center w-5 h-5 absolute bottom-0 right-0 left-0 top-0 m-auto text-[8px] text-center leading-none text-magnet"
                        style={{
                          color:
                            winner.position > 3 ? "white" : "var(--magnet)",
                        }}
                      >
                        {winner.position}
                      </span>
                    </span>
                    <span className="inline-block text-[10px] leading-none truncate max-w-[117px]">
                      {winner.wallet}
                    </span>
                  </div>
                  <div className="relative z-[2] pl-3 bg-inkwell inline-flex gap-1.5 justify-end items-center text-[10px]">
                    <span className="relative inline-block leading-none">
                      {formatNumber(+winner.balance)}
                    </span>
                    <TicketIcon />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative opacity-35 mb-4">
          <PixelWrapper width={3} color="gray" />
          <div className="bg-inkwell flex justify-center items-center pt-3 px-4 pb-4 h-[200px]">
            <p className="text-[13px] leading-none uppercase">Games coming soon ***</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
