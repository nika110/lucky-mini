import { FC } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { ErrorBigIcon } from "../UI/Icons/ErrorBigIcon";

const ErrorModal: FC = () => {
  const MODAL_KEY = MODALS.ERROR;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent variant={"info"}>
        <ErrorBigIcon />
        <p>Something went WROng! try again!</p>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;
