import { FC, useState } from "react";
// import NumberFormatter from "@/components/shared/NumberFormatter/NumberFormatter";
import { Button } from "@/components/shared/UI/button";
import { Chip } from "@/components/shared/UI/Icons/Chip";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { Copy } from "@/components/shared/UI/Icons/Copy";
import { formatNumber } from "@/helpers/formatCount";
import { AmountShowcase } from "@/components/shared/AmountShowcase/AmountShowcase";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/shared/UI/dialog";

const MainGame: FC = () => {
  // const [prizePool] = useState(5);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] =
    useState<boolean>(false);

  const [testD, setTestD] = useState<number>(0);

  const initializePurchase = () => {
    setIsPurchaseModalOpen(true);
  };

  return (
    <section className={"pt-16"}>
      <Dialog
        open={isPurchaseModalOpen}
        onOpenChange={(v) => setIsPurchaseModalOpen(v)}
      >
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          
        </DialogContent>
      </Dialog>
      <div className="container">
        {/* PRIZE POOL */}
        <h1 className="text-xl text-center uppercase mb-4">prize pool:</h1>

        <div className="relative flex justify-center">
          <AmountShowcase defaultAmount={testD} />
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
          <Button onClick={() => initializePurchase()}>Buy Ticket</Button>
          <Button
            variant={"ghost"}
            onClick={() => {
              // setTestD(Math.floor(Math.random() * 7) + 1);
              setTestD(testD + 1);
            }}
          >
            How it works
          </Button>
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
  const [pastWinners] = useState([
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
