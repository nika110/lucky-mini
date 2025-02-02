import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { WarningIcon } from "../UI/Icons/WarningIcon";

// interface WalletConnectedProps {}

const SoonModal: FC = () => {
  const MODAL_KEY = MODALS.SOON;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <WarningIcon />
        <p>This feature is coming soon!</p>
      </DialogContent>
    </Dialog>
  );
};

export default SoonModal;
