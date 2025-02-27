import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
// import NumberFormatter from "@/components/shared/NumberFormatter/NumberFormatter";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { Copy } from "@/components/shared/UI/Icons/Copy";
import { formatNumber } from "@/helpers/formatCount";
import { useAppDispatch } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { User } from "@/types/user";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  useGetConfigQuery,
  useGetCurrentRaffleQuery,
} from "@/redux/services/raffle.api";
import { useCloudStorage } from "@/hooks/useCloudeStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import { intervalToDuration } from "date-fns";
// import { connectionStatus } from "./constants";
import { MainGameActions } from "./MainGameActions";
import { TonFilled } from "@/components/shared/UI/Icons/TonFilled";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import LostModal from "@/components/shared/Modals/LostModal";
import WonModal from "@/components/shared/Modals/WonModal";
import { GiftIcon } from "@/components/shared/UI/Icons/GiftIcon";
import gsap from "gsap";
import { GAME_TYPE } from "@/types/raffle";

interface MainGameProps {
  user: User | null;
}

interface Winner {
  user_id: string;
  amount: number;
  position: number;
}

export const NANO_TON = "0000000";

const MainGame: FC<MainGameProps> = ({ user }) => {
  const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

  const gameRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { lastMessage, readyState } = useWebSocket(websocketUrl);

  const { data: tokenStorage } = useCloudStorage(STORAGE_KEYS.TOKEN);
  const token = tokenStorage ? (tokenStorage as string) : null;

  const [rafflePool, setRafflePool] = useState<number | null>(0);
  const [winAmount, setWinAmount] = useState<number>(0);

  const {
    data: currentRaffle,
    refetch: refetchCurrentRaffle,
    isLoading: isLoadingCurrentRaffle,
    isFetching: isFetchingCurrentRaffle,
  } = useGetCurrentRaffleQuery(
    {
      token: token ? token : "",
      telegram_id: user ? user.telegram_id : "",
      gameType: GAME_TYPE.LUCKY_RAFFLE,
    },
    { skip: !user || !token || !readyState }
  );

  const { data: raffleConfig, isLoading: isLoadingConfig } = useGetConfigQuery(
    { telegram_id: user ? user.telegram_id : "" },
    { skip: !user }
  );

  const increaseTickets = (amount: number) => {
    setRafflePool(rafflePool ? rafflePool + amount : amount);
  };

  const ticketsToPrice = (amount: number): null | string => {
    if (raffleConfig) {
      const { data: priceInfo } = raffleConfig;
      const price = +priceInfo.ticket_price * amount;
      return price.toString();
    }
    return "0";
  };

  useEffect(() => {
    if (lastMessage && user) {
      const data = JSON.parse(lastMessage.data);
      switch (data.type) {
        case "pool_update": {
          setRafflePool(+data.total_pool);
          break;
        }
        case "new_raffle": {
          toast.message("A new raffle has started!", {
            duration: 4000,
          });
          setRafflePool(0);
          refetchCurrentRaffle();
          break;
        }
        case "raffle_ended": {
          setRafflePool(null);
          const winners = data.winners as Winner[];
          const isWinner = winners.find(
            (winner) => winner.user_id === user?.id
          );
          console.log("isWinner", isWinner, winners);
          if (isWinner) {
            setWinAmount(isWinner.amount);
            dispatch(toggleModal({ key: MODALS.WON_RAFFLE, value: true }));
          } else {
            setWinAmount(0);
            if (currentRaffle && currentRaffle.data.participating) {
              dispatch(toggleModal({ key: MODALS.YOU_LOST, value: true }));
            } else {
              toast.message("Raffle ended without you! Try it next time!", {
                duration: 4000,
              });
            }
          }
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, dispatch, refetchCurrentRaffle, user]);

  useEffect(() => {
    if (currentRaffle) {
      if (currentRaffle.data.participating) {
        toast.message(
          "You are participating in the current raffle! Good Luck!",
          {
            icon: <GiftIcon />,
          }
        );
      }
      setRafflePool(+currentRaffle.data.current_pool);
    }
  }, [currentRaffle]);

  useLayoutEffect(() => {
    if (gameRef.current) {
      const gameBlock = gameRef.current;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          gameBlock.querySelector("#mainPastWinners"),
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            delay: 0.35,
            ease: "power4.inOut",
          }
        );
      });
      return () => ctx.revert();
    }
  }, [gameRef]);

  const isRaffleLoaded =
    rafflePool !== null &&
    !isLoadingCurrentRaffle &&
    !isFetchingCurrentRaffle &&
    !isLoadingConfig &&
    readyState === ReadyState.OPEN &&
    currentRaffle &&
    +currentRaffle.data.end_time * 1000 > Date.now()
      ? true
      : false;

  return (
    <section ref={gameRef} className={"pt-16"}>
      <LostModal />
      <WonModal winAmount={winAmount} />
      <div className="container">
        {/* PRIZE POOL */}
        <div>
          <h1 className="text-xl text-center uppercase mb-4">
            {rafflePool === null ? "Selecting winners" : "prize pool:"}
          </h1>
          <div className="flex justify-center relative">
            <AnimatePresence mode="wait">
              {isRaffleLoaded ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center gap-1.5 !text-2xl leading-none"
                  key={"raffle_count"}
                >
                  <span className="inline-flex items-center relative text-white">
                    {ticketsToPrice(rafflePool || 0)}
                    <span className="absolute top-auto left-1 right-1 -bottom-[1px] bg-marigold w-auto h-[2px]" />
                  </span>
                  <TonFilled className="w-8 h-8" />
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center items-center h-8"
                  key={"raffle_count_loaduing"}
                >
                  <CubesLoading size={12} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TIME REMAINING */}
        <RaffleCountdown
          timeRemaining={
            isRaffleLoaded && currentRaffle
              ? +currentRaffle.data.end_time
              : null
          }
        />
        {/* ACTIONS */}
        <MainGameActions user={user} increaseTickets={increaseTickets} />
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
    <div id="mainPastWinners" className="relative mt-8">
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

interface RaffleCountdownProps {
  timeRemaining: number | null;
}

type Duration = {
  hours: number;
  minutes: number;
  seconds: number;
};

const RaffleCountdown: FC<RaffleCountdownProps> = ({ timeRemaining }) => {
  const [duration, setDuration] = useState<Duration>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!timeRemaining) return;
    const updateCountdown = () => {
      const timestamp = timeRemaining * 1000;
      const now = new Date();
      const end = new Date(timestamp);

      const duration = intervalToDuration({
        start: now,
        end: end,
      });

      setDuration({
        hours: duration.hours && duration.hours > 0 ? duration.hours : 0,
        minutes:
          duration.minutes && duration.minutes > 0 ? duration.minutes : 0,
        seconds:
          duration.seconds && duration.seconds > 0 ? duration.seconds : 0,
      });
    };

    // Initial update
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Format number to always show two digits
  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex mt-8 flex-col justify-center items-center gap-3.5">
      <h2 className="text-base uppercase text-center leading-3">
        time remaining:
      </h2>
      <span className={`text-center text-[20px] uppercase leading-none`}>
        <span
          className={`transition-all duration-300 ${
            !timeRemaining ? "!text-dim" : "text-white"
          }`}
        >
          {formatNumber(duration.hours)}
        </span>
        <span className="text-dim">H</span>
        &nbsp;
        <span
          className={`transition-all duration-300 ${
            !timeRemaining ? "!text-dim" : "text-white"
          }`}
        >
          {formatNumber(duration.minutes)}
        </span>
        <span className="text-dim">M</span>
        &nbsp;
        <span
          className={`transition-all duration-300 ${
            !timeRemaining ? "!text-dim" : "text-white"
          }`}
        >
          {formatNumber(duration.seconds)}
        </span>
        <span className="text-dim">S</span>
      </span>
    </div>
  );
};

export default MainGame;
