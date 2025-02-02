import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { InfoIcon } from "../UI/Icons/InfoIcon";
import { Button } from "../UI/button";

const RulesLuckyTapModal: FC = () => {
  const MODAL_KEY = MODALS.RULES_LUCKY_TAP;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <InfoIcon />
        <p>
          CLICK TO LUCKY
          <br />
          SIGNS TO GET XP!
        </p>
        <div className="flex justify-center items-center pb-4">
          <Button className="w-[135px] shrink-0">Got It</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RulesLuckyTapModal;
