import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { resetStats, STARS, STATS } from "@/redux/features/stats.reducer";
import { XPIcon } from "../UI/Icons/XPIcon";
import { CpsIcon } from "../UI/Icons/CpsIcon";
import { ClicksIcon } from "../UI/Icons/ClicksIcon";
import { Button } from "../UI/button";
import { ROUTES } from "@/routes/routes";
import { useNavigate } from "react-router-dom";

const FinishLuckyTap: FC = () => {
  const navigate = useNavigate();
  const MODAL_KEY = MODALS.FINISH_LUCKY_TAP;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);
  const stats = useAppSelector((state) => state.stats.tap);
  console.log(stats);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
    dispatch(resetStats({ type: STATS.TAP }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <h2 className="text-center text-[20px] leading-none mt-4">COMPLETE!</h2>
        <div className="flex justify-center items-center">
          {stats ? (
            stats.stars === STARS.THREE ? (
              <img
                src="/3stars.svg"
                alt="3 stars"
                className="shrink-0 w-[200px] h-auto object-contain"
                style={{ aspectRatio: "200/92" }}
              />
            ) : stats.stars === STARS.TWO ? (
              <img
                src="/2stars.svg"
                alt="2 stars"
                className="shrink-0 w-[200px] h-auto object-contain"
                style={{ aspectRatio: "200/92" }}
              />
            ) : stats.stars === STARS.ONE ? (
              <img
                src="/1star.svg"
                alt="1 stars"
                className="shrink-0 w-[200px] h-auto object-contain"
                style={{ aspectRatio: "200/92" }}
              />
            ) : null
          ) : null}
        </div>
        <div className="flex flex-col gap-y-3.5 justify-center items-center mb-1.5">
          <p className="text-base text-[#AAAAAA]">STATS:</p>
          <p className="text-white text-lg uppercase leading-none flex justify-center items-center gap-[6px]">
            {stats?.finishScore ? stats.finishScore : "0"}
            <XPIcon className="!w-4 !h-4" />
            &#8226;
            <span>EARNED</span>
          </p>
          <p className="text-white text-lg uppercase leading-none flex justify-center items-center gap-[6px]">
            {stats?.clicksPerSecond ? stats.clicksPerSecond : "0.00"}
            <CpsIcon className="!w-[15px] !h-[22px]" />
            &#8226;
            <span>CPS</span>
          </p>
          <p className="text-white text-lg uppercase leading-none flex justify-center items-center gap-[6px]">
            {stats?.totalClicks ? stats.totalClicks : "0"}
            <ClicksIcon className="!w-[17px] !h-[17px]" />
            &#8226;
            <span>CLICKS</span>
          </p>
        </div>
        <div className="flex justify-center items-center gap-3 mb-3">
          <Button className="w-[100px]" onClick={() => onOpenChange(false)}>
            Retry
          </Button>
          <Button
            variant={"ghost"}
            className="w-[100px]"
            onClick={() => {
              dispatch(toggleModal({ key: MODAL_KEY, value: false }));
              dispatch(resetStats({ type: STATS.TAP }));
              navigate(ROUTES.GAMES, { replace: true });
            }}
          >
            Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinishLuckyTap;
