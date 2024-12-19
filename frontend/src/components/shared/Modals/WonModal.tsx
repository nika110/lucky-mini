import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { WonIcon } from "../UI/Icons/WonIcon";

const LostModal: FC = () => {
  const MODAL_KEY = MODALS.WON_RAFFLE;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <WonIcon />
        <p>You won! <br /> Expect a payout soon!</p>
      </DialogContent>
    </Dialog>
  );
};

export default LostModal;
