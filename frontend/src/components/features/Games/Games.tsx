import { XPIcon } from "@/components/shared/UI/Icons/XPIcon";
import { User } from "@/types/user";
import { FC, useLayoutEffect, useRef } from "react";
import { CassetteGame, cassetteGames } from "./constants";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

interface GamesProps {
  user: User | null;
}

export const Games: FC<GamesProps> = ({ user }) => {
  const navigate = useNavigate();
  const gamesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (gamesRef.current) {
      const gamesBlock = gamesRef.current;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          gamesBlock.querySelector("#gamesLeftController"),
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 1, ease: "power4.inOut" }
        );
        gsap.fromTo(
          gamesBlock.querySelector("#gamesRightController"),
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: "power4.inOut" }
        );
        gsap.fromTo(
          gamesBlock.querySelector("#gamesTitle"),
          { opacity: 0 },
          { opacity: 1, duration: 0.7, delay: 0.3, ease: "power4.inOut" }
        );
        const cassettes = gsap.utils.toArray(
          gamesBlock.querySelectorAll("#gamesCassettes #cassette")
        ) as HTMLElement[];
        cassettes.forEach((cassette, index) => {
          gsap.fromTo(
            cassette as HTMLElement,
            { opacity: 0, y: 50 },
            {
              opacity: cassette.classList.contains("opacity-35") ? 0.35 : 1,
              y: 0,
              duration: 1,
              delay: index * 0.1,
              ease: "power4.inOut",
            }
          );
        });
      });
      return () => ctx.revert();
    }
  }, []);

  const handleClickCassette = async (cassette: CassetteGame) => {
    if (cassette.link && gamesRef.current) {
      // Create reverse animation timeline
      const timeline = gsap.timeline();
      const gamesBlock = gamesRef.current;

      const cassettes = gsap.utils
        .toArray(gamesBlock.querySelectorAll("#gamesCassettes #cassette"))
        .reverse() as HTMLElement[];
      cassettes.forEach((cassette, index) => {
        timeline.fromTo(
          cassette as HTMLElement,
          { opacity: cassette.classList.contains("opacity-35") ? 0.35 : 1 , y: 0 },
          {
            opacity: 0,
            y: 50,
            duration: 1,
            delay: index * 0.1,
            ease: "power4.inOut",
          },
          "0"
        );
      });

      timeline.fromTo(
        gamesBlock.querySelector("#gamesLeftController"),
        { opacity: 1, y: 0 },
        { opacity: 0, y: -50, duration: 1, ease: "power4.inOut" },
        "0"
      );
      timeline.fromTo(
        gamesBlock.querySelector("#gamesRightController"),
        { opacity: 1, y: 0 },
        { opacity: 0, y: -50, duration: 1, delay: 0.1, ease: "power4.inOut" },
        "0"
      );
      timeline.fromTo(
        gamesBlock.querySelector("#gamesTitle"),
        { opacity: 1 },
        { opacity: 0, duration: 0.7, delay: 0, ease: "power4.inOut" },
        "0.3"
      );

      timeline.fromTo(
        document.querySelector("#navbar"),
        { opacity: 1, y: 0 },
        { opacity: 0, y: 25, duration: 0.85, delay: 0, ease: "power4.inOut" },
        "0.3"
      );

      await timeline.play();
      navigate(cassette.link);
    }
  };

  return (
    <div ref={gamesRef} className="relative block container h-screen">
      <div className="grid grid-cols-2 gap-3.5 items-start">
        <img
          src="/jstickgames.svg"
          alt="Games"
          id="gamesLeftController"
          className="w-full shrink-0 h-auto object-contain"
          style={{ aspectRatio: "165/143" }}
        />
        <div
          id="gamesRightController"
          className="relative w-full shrink-0 flex justify-cente items-center"
          style={{ aspectRatio: "165/143" }}
        >
          <img
            src="/jstickpurple.svg"
            alt="Balance"
            className="w-full shrink-0 h-auto object-contain"
          />
          <div className="absolute bottom-[24%] m-auto left-0 right-0 top-auto flex justify-center flex-col gap-1.5 items-center">
            <span className="uppercase text-sm text-white leading-none">
              balance:
            </span>
            {user ? (
              <span className="inline-flex justify-center items-center gap-1.5 text-lg text-white leading-none">
                {user.xp}
                <XPIcon className="!w-4 !h-4" />
              </span>
            ) : (
              <span className="inline-flex justify-center items-center gap-1.5 text-lg text-white leading-none">
                N/A
                <XPIcon className="!w-4 !h-4" />
              </span>
            )}
            <span></span>
          </div>
        </div>
      </div>
      <h1
        id="gamesTitle"
        className="text-base uppercase text-white text-center max-w-[245px] m-auto mt-9 mb-4"
      >
        CLICK ON CASSETtE TO PLAY MINI GAME
      </h1>
      <div id="gamesCassettes" className="grid grid-cols-2 gap-x-5 gap-y-5">
        {cassetteGames.map((game) => (
          <GameCassette game={game} handleClickCassette={handleClickCassette} />
        ))}
        <GameCassetteSoon />
      </div>
    </div>
  );
};
interface GameCassetteProps {
  game: CassetteGame;
  handleClickCassette: (cassette: CassetteGame) => void;
}

export const GameCassette: FC<GameCassetteProps> = ({
  game,
  handleClickCassette,
}) => {
  return (
    <div
      onClick={() => handleClickCassette(game)}
      className="relative block w-full shrink-0 h-[100px] bg-inkwell pt-3"
      id="cassette"
    >
      {/* CORNERS */}
      <div className="w-full h-1.5 -top-1.5 left-0 absolute bg-liquor" />
      <div className="w-full h-1.5 -bottom-1.5 left-0 absolute bg-liquor" />
      <div className="w-1.5 h-full top-0 -left-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-full top-0 -right-1.5 absolute bg-liquor" />
      {/* DOTS */}
      <div className="w-1.5 h-1.5 top-1.5 left-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-1.5 top-1.5 right-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-1.5 bottom-1.5 left-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-1.5 bottom-1.5 right-1.5 absolute bg-liquor" />
      {/* INNER DIV */}
      <div className="w-[calc(100%-36px)] relative m-auto h-[58px] shrink-0 bg-marigold mb-3">
        {/* INNER CORNERS */}
        <div className="w-full h-1.5 top-0 left-0 absolute bg-liquor" />
        <div className="w-full h-1.5 bottom-0 left-0 absolute bg-liquor" />
        <div className="w-1.5 h-full top-0 left-0 absolute bg-liquor" />
        <div className="w-1.5 h-full top-0 right-0 absolute bg-liquor" />
        {/* DECORATIONS */}
        <div className="absolute top-3 left-3 right-3 bottom-auto m-auto h-1.5 bg-liquor">
          <div className="relative w-full h-full">
            <div className="w-1.5 h-1.5 top-0 left-3 absolute bg-marigold" />
            <div className="w-1.5 h-1.5 top-0 right-3 absolute bg-marigold" />
          </div>
        </div>
        <div className="absolute top-[24px] left-[30px] right-[30px] bottom-auto m-auto h-1.5 bg-liquor" />
        <div className="absolute top-[36px] left-[30px] right-[30px] bottom-auto m-auto h-1.5 bg-liquor" />
        <div className="absolute top-[30px] left-[30px] right-[30px] bottom-auto m-auto h-1.5 bg-white" />
        <div className="absolute top-[30px] left-[24px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] right-[24px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] right-[48px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] left-[48px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] left-[54px] right-[54px] h-1.5 bg-corn" />
      </div>
      <div className="w-[calc(100%-48px)] flex justify-center items-center relative m-auto h-[18px] bg-nero">
        <div className="w-[calc(100%-0px)] m-auto h-1.5 -top-1.5 left-0 right-0 absolute bg-liquor" />
        <div className="w-1.5 h-[18px] bottom-0 -left-1.5 absolute bg-liquor" />
        <div className="w-1.5 h-[18px] bottom-0 -right-1.5 absolute bg-liquor" />
        <span className="text-center text-base uppercase text-white leading-none">
          {game.name}
        </span>
      </div>
    </div>
  );
};

export const GameCassetteSoon: FC = () => {
  return (
    <div
      id="cassette"
      className="relative block w-full shrink-0 h-[100px] bg-inkwell pt-3 opacity-35"
    >
      {/* CORNERS */}
      <div className="w-full h-1.5 -top-1.5 left-0 absolute bg-liquor" />
      <div className="w-full h-1.5 -bottom-1.5 left-0 absolute bg-liquor" />
      <div className="w-1.5 h-full top-0 -left-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-full top-0 -right-1.5 absolute bg-liquor" />
      {/* DOTS */}
      <div className="w-1.5 h-1.5 top-1.5 left-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-1.5 top-1.5 right-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-1.5 bottom-1.5 left-1.5 absolute bg-liquor" />
      <div className="w-1.5 h-1.5 bottom-1.5 right-1.5 absolute bg-liquor" />
      {/* INNER DIV */}
      <div className="w-[calc(100%-36px)] relative m-auto h-[58px] shrink-0 bg-marigold mb-3">
        {/* INNER CORNERS */}
        <div className="w-full h-1.5 top-0 left-0 absolute bg-liquor" />
        <div className="w-full h-1.5 bottom-0 left-0 absolute bg-liquor" />
        <div className="w-1.5 h-full top-0 left-0 absolute bg-liquor" />
        <div className="w-1.5 h-full top-0 right-0 absolute bg-liquor" />
        {/* DECORATIONS */}
        <div className="absolute top-3 left-3 right-3 bottom-auto m-auto h-1.5 bg-liquor">
          <div className="relative w-full h-full">
            <div className="w-1.5 h-1.5 top-0 left-3 absolute bg-marigold" />
            <div className="w-1.5 h-1.5 top-0 right-3 absolute bg-marigold" />
          </div>
        </div>
        <div className="absolute top-[24px] left-[30px] right-[30px] bottom-auto m-auto h-1.5 bg-liquor" />
        <div className="absolute top-[36px] left-[30px] right-[30px] bottom-auto m-auto h-1.5 bg-liquor" />
        <div className="absolute top-[30px] left-[30px] right-[30px] bottom-auto m-auto h-1.5 bg-white" />
        <div className="absolute top-[30px] left-[24px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] right-[24px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] right-[48px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] left-[48px] h-1.5 w-1.5 bg-liquor" />
        <div className="absolute top-[30px] left-[54px] right-[54px] h-1.5 bg-corn" />
      </div>
      <div className="w-[calc(100%-48px)] flex justify-center items-center relative m-auto h-[18px] bg-nero">
        <div className="w-[calc(100%-0px)] m-auto h-1.5 -top-1.5 left-0 right-0 absolute bg-liquor" />
        <div className="w-1.5 h-[18px] bottom-0 -left-1.5 absolute bg-liquor" />
        <div className="w-1.5 h-[18px] bottom-0 -right-1.5 absolute bg-liquor" />
        <span className="text-center text-[10px] uppercase text-white leading-none">
          COMING SOON
        </span>
      </div>
    </div>
  );
};
