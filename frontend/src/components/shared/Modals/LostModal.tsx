import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { LostIcon } from "../UI/Icons/LostIcon";

const LostModal: FC = () => {
  const MODAL_KEY = MODALS.YOU_LOST;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <LostIcon />
        <p>You lost! <br /> Try again!</p>
      </DialogContent>
    </Dialog>
  );
};

export default LostModal;
