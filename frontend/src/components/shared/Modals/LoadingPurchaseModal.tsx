import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { LoadingPurchaseIcon } from "../UI/Icons/LoadingPurchase";

const LoadingPurchaseModal: FC = () => {
  const MODAL_KEY = MODALS.PURCHASE_LOADING;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <LoadingPurchaseIcon />
        <p>PROCESSING... DONT CLOSE THE POPUP!</p>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingPurchaseModal;
