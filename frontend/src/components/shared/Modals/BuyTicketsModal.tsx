import { FC, useState } from "react";
import { Dialog, DialogContent } from "@/components/shared/UI/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { Button } from "@/components/shared/UI/button";
import { TicketIcon } from "../UI/Icons/TicketIcon";
import { Input } from "../UI/input";

interface BuyTicketsProps {
  onPurchase: (a: number) => void;
}
const BuyTicketsModal: FC<BuyTicketsProps> = ({ onPurchase }) => {
  const MODAL_KEY = MODALS.BUY_TICKET;
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modals[MODAL_KEY]);

  const [amountInput, setAmountInput] = useState(0);

  const handleBuyTickets = (amount: number) => {
    onPurchase(amount);
    dispatch(
      toggleModal([
        { key: MODAL_KEY, value: false },
        { key: MODALS.PURCHASE_LOADING, value: true },
      ])
    );
  };

  const closeModal = () => {
    dispatch(toggleModal({ key: MODAL_KEY, value: false }));
    setAmountInput(0);
  };

  const onOpenChange = (isOpen: boolean) => {
    dispatch(toggleModal({ key: MODAL_KEY, value: isOpen }));
    if (!isOpen) setAmountInput(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent className="px-5">
        <h2 className="uppercase text-center mb-7 mt-3">rEADY TO buy?</h2>

        <div className="flex justify-center items-center gap-1 mb-7">
          <span className="text-2xl leading-none">{amountInput}</span>
          <span>
            <TicketIcon className="w-10 h-5" />
          </span>
        </div>
        <Input
          type="number"
          value={amountInput === 0 ? "" : amountInput}
          placeholder="Amount..."
          onChange={(e) => setAmountInput(Number(e.target.value))}
        />
        <div className="w-full h-[2px] bg-liquor my-2" />
        <div className="grid grid-cols-4 items-center gap-3 mb-8">
          <Button
            className="text-base"
            onClick={() => setAmountInput(amountInput + 1)}
          >
            +1
          </Button>
          <Button
            className="text-base"
            onClick={() => setAmountInput(amountInput + 5)}
          >
            +5
          </Button>
          <Button
            className="text-base"
            onClick={() => setAmountInput(amountInput + 20)}
          >
            +20
          </Button>
          <Button
            className="text-base"
            onClick={() => setAmountInput(amountInput + 100)}
          >
            +100
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <Button variant={"ghost"} onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button onClick={() => handleBuyTickets(5)}>Buy Tickets</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyTicketsModal;
