import { Button } from "@/components/shared/UI/button";
import { InfoMiniIcon } from "@/components/shared/UI/Icons/InfoMiniIcon";
import { TonFilled } from "@/components/shared/UI/Icons/TonFilled";
import { XPIcon } from "@/components/shared/UI/Icons/XPIcon";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { useAppDispatch } from "@/redux/store";
import { ROUTES } from "@/routes/routes";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";

export const Lucky31 = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const ref31 = useRef<HTMLDivElement>(null);

  const cells = Array.from({ length: 30 }, (_, index) => index + 1);

  useLayoutEffect(() => {
    if (ref31.current) {
      const block31 = ref31.current;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          block31.querySelector("#PrizePool31"),
          {
            y: -50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          block31.querySelector("#Timer31"),
          {
            y: -50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.1,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          block31.querySelector("#Header31"),
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.85,
            delay: 0.35,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          block31.querySelector("#Table31"),
          {
            opacity: 0,
            y: 20,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            delay: 0.1,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          block31.querySelector("#LeftBtn31"),
          {
            opacity: 0,
            y: 35,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: 0.45,
            ease: "power4.inOut",
          }
        );

        gsap.fromTo(
          block31.querySelector("#RightBtn31"),
          {
            opacity: 0,
            y: 35,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: 0.55,
            ease: "power4.inOut",
          }
        );
      });
      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={ref31} className="relative container">
      <div
        id="Header31"
        className="mt-9 flex justify-center items-center gap-1"
      >
        <img
          src="/lucky31.svg"
          className="w-[192px] h-[24px] object-contain shrink-0"
          style={{ aspectRatio: "192/24" }}
        />
        <button
          onClick={() =>
            dispatch(toggleModal({ key: MODALS.INFO_LUCKY_31, value: true }))
          }
        >
          <InfoMiniIcon />
        </button>
      </div>
      <div className="relative mt-8 bottom-auto grid grid-cols-2 h-[80px] w-full items-center gap-4">
        <div
          id="PrizePool31"
          className="relative bg-inkwell w-full h-[80px] flex flex-col justify-center items-center gap-3"
        >
          <PixelWrapper width={2} color={"gray"} />
          <span className="text-center text-base leading-none text-rock uppercase">
            prize pool:
          </span>
          <span className="flex justify-center items-center gap-2 text-xl">
            <span>{0}</span>
            <TonFilled className="w-5 h-5" />
          </span>
        </div>
        <div
          id="Timer31"
          className="relative bg-inkwell w-full h-[80px] flex flex-col justify-center items-center gap-3"
        >
          <PixelWrapper width={2} color={"gray"} />
          <span className="text-center text-base leading-none text-rock uppercase">
            time LEFT:
          </span>
          <span className="flex justify-center items-center gap-2 text-xl">
            <img src="/clock.svg" className="w-5 h-5" />
            <span>
              {Math.ceil(60000 / 1000)}
              <span className="text-rock uppercase">S</span>
            </span>
          </span>
        </div>
      </div>

      <div id="Table31" className="relative bg-inkwell w-full mt-4 mb-9">
        <PixelWrapper width={2} color={"gray"} />
        <div className="w-full p-4">
          <div className="pb-2.5 border-b-[3px] border-liquor flex justify-between items-center">
            <span className="uppercase text-base leading-none text-rock">
              last winners:
            </span>
            <span className="text-white text-base leading-none">
              5-13-16-31-40
            </span>
          </div>
          <div className="flex flex-col justify-center items-center mt-5">
            <div className="grid grid-cols-6 grid-rows-5 gap-3.5 shrink-0 w-full">
              {cells.map((_, index) => {
                const row = Math.floor(index / 6);
                const isEvenRow = row % 2 === 0;
                const isEvenCol = index % 2 === 0;
                const isDark = isEvenRow ? isEvenCol : !isEvenCol;

                return (
                  <div
                    key={index}
                    className={`relative flex justify-center items-center h-[35px] ${
                      isDark ? "bg-inkwell" : "bg-liquor"
                    }`}
                  >
                    <PixelWrapper width={2} color={"gray"} />
                    <span className="text-[18px] uppercase leading-none text-center">
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="shrink-0 flex justify-center items-center gap-4 mt-3.5 mb-5">
              <XPIcon className="!w-4 !h-4" color="grey" />
              <div className="w-[128px] relative h-[35px] flex justify-center items-center bg-liquor">
                <PixelWrapper width={2} color={"gray"} />
                <span className="text-[18px] uppercase leading-none text-center">
                  {31}
                </span>
              </div>
              <XPIcon className="!w-4 !h-4" color="grey" />
            </div>
            <p className="w-full uppercase text-center text-sm leading-4 text-rock">
              TIP: When a number becomes hot,
              <br />
              its background turns YellowER!
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 mb-11">
        <Button id="LeftBtn31" className="w-[135px]" onClick={() => {}}>
          Random
        </Button>
        <Button
          id="RightBtn31"
          variant={"ghost"}
          className="w-[135px]"
          onClick={() => {
            navigate(ROUTES.GAMES);
          }}
        >
          Back to Menu
        </Button>
      </div>
    </div>
  );
};
