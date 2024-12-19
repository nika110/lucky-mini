import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { WarningIcon } from "../UI/Icons/WarningIcon";

// interface WalletConnectedProps {}

const WalletNotConnectedModal: FC = () => {
  const MODAL_KEY = MODALS.WALLET_NOT_CONNECTED;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <WarningIcon />
        <p>You have not connected your wallet!</p>
      </DialogContent>
    </Dialog>
  );
};

export default WalletNotConnectedModal;
