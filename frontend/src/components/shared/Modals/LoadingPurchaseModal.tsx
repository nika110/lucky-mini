import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppSelector } from "@/redux/store";
import { MODALS } from "@/redux/features/modals.reducer";
import { LoadingPurchaseIcon } from "../UI/Icons/LoadingPurchase";

const LoadingPurchaseModal: FC = () => {
  const MODAL_KEY = MODALS.PURCHASE_LOADING;
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  return (
    <Dialog open={isOpen}>
      <DialogContent variant={"info"} closeBtn={false}>
        <LoadingPurchaseIcon />
        <p>PROCESSING... DONT CLOSE THE POPUP!</p>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingPurchaseModal;
