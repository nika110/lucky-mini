import { FC, useCallback, useMemo } from "react";
import { CHAIN, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Button } from "@/components/shared/UI/button";
import { Chip } from "@/components/shared/UI/Icons/Chip";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { useGetConfigQuery } from "@/redux/services/raffle.api";
import { usePurchaseTicketsMutation } from "@/redux/services/wallet.api";
import { useAppDispatch } from "@/redux/store";
import { User } from "@/types/user";
import { calculateNanoTonsToBuy } from "./utils";

// Components
import BuyTicketsModal from "@/components/shared/Modals/BuyTicketsModal";
import ErrorModal from "@/components/shared/Modals/ErrorModal";
import LoadingPurchaseModal from "@/components/shared/Modals/LoadingPurchaseModal";
import SuccessPurchaseModal from "@/components/shared/Modals/SuccesPurchaseModal";
import WalletNotConnectedModal from "@/components/shared/Modals/WalletConnectedModal";
import { GAME_TYPE } from "@/types/raffle";

// Constants
const TON_CONTRACT_ADDRESS = "UQBY4Mp4Niqts0nhCDJj01JBseN4aIgCVfclZfwHhLFJpIqj";
const TRANSACTION_VALIDITY_HOURS = 1;
const PROOF_OF_FAIRNESS_URL = "https://www.google.com";
const HOW_IT_WORKS_URL = "https://www.google.com";

interface MainGameActionsProps {
  user: User | null;
  increaseTickets: (amount: number) => void;
}

export const MainGameActions: FC<MainGameActionsProps> = ({
  user,
  increaseTickets,
}) => {
  const dispatch = useAppDispatch();
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();

  const { data: raffleConfig } = useGetConfigQuery(
    { telegram_id: user?.telegram_id ?? "" },
    { skip: !user }
  );

  const [purchaseTicketsMutation] = usePurchaseTicketsMutation();

  const isWalletConnected = useMemo(
    () => Boolean(user?.ton_public_key && tonWallet),
    [user?.ton_public_key, tonWallet]
  );

  const handleBuyTicketsClick = useCallback(() => {
    if (!user) return;

    const modalKey = isWalletConnected
      ? MODALS.BUY_TICKET
      : MODALS.WALLET_NOT_CONNECTED;

    dispatch(toggleModal({ key: modalKey, value: true }));
  }, [dispatch, isWalletConnected, user]);

  const handleTransactionError = useCallback(() => {
    dispatch(
      toggleModal([
        { key: MODALS.PURCHASE_LOADING, value: false },
        { key: MODALS.ERROR, value: true },
      ])
    );
  }, [dispatch]);

  const handlePurchaseSuccess = useCallback(
    (amount: number) => {
      increaseTickets(amount);
      dispatch(
        toggleModal([
          { key: MODALS.PURCHASE_LOADING, value: false },
          { key: MODALS.PURCHASE_SUCCESS, value: true },
        ])
      );
    },
    [dispatch, increaseTickets]
  );

  const purchaseTickets = useCallback(
    async (amount: number) => {
      if (!raffleConfig || !tonWallet || !user) {
        handleTransactionError();
        return;
      }

      const { ticket_price: ticketPrice } = raffleConfig.data;
      const amountToBuy = calculateNanoTonsToBuy(amount, +ticketPrice);
      const validUntil =
        Math.floor(Date.now() / 1000) + TRANSACTION_VALIDITY_HOURS * 60 * 60;

      try {
        const transaction = await tonConnectUI.sendTransaction({
          network: CHAIN.MAINNET,
          validUntil,
          messages: [
            {
              address: TON_CONTRACT_ADDRESS,
              amount: amountToBuy,
            },
          ],
        });

        const purchaseResult = await purchaseTicketsMutation({
          boc: transaction.boc,
          amount: amountToBuy,
          address: tonWallet.account.address,
          telegramId: user.telegram_id,
          gameType: GAME_TYPE.LUCKY_RAFFLE,
        }).unwrap();

        handlePurchaseSuccess(purchaseResult.data.amount);
      } catch {
        handleTransactionError();
      }
    },
    [
      raffleConfig,
      tonWallet,
      user,
      tonConnectUI,
      purchaseTicketsMutation,
      handleTransactionError,
      handlePurchaseSuccess,
    ]
  );

  const isButtonDisabled = !user || !raffleConfig || !tonWallet;

  return (
    <>
      {tonWallet && raffleConfig && (
        <BuyTicketsModal onPurchase={purchaseTickets} />
      )}
      <LoadingPurchaseModal />
      <ErrorModal />
      <SuccessPurchaseModal />
      <WalletNotConnectedModal />

      <div className="grid px-3.5 grid-cols-2 mt-14 justify-center items-center gap-4">
        <Button disabled={isButtonDisabled} onClick={handleBuyTicketsClick}>
          Buy Ticket
        </Button>
        <a
          href={HOW_IT_WORKS_URL}
          className="block w-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" className="w-full">
            How it works
          </Button>
        </a>
      </div>

      <a
        href={PROOF_OF_FAIRNESS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex mt-3.5 justify-center items-center gap-1.5 text-magnet text-xs uppercase text-center transition-colors duration-150 active:text-white"
      >
        <span className="relative inline-block">
          <span className="relative inline-block">
            PROOF OF FAIRNESS
            <span className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-liquor w-full" />
          </span>
          &nbsp; (FOR NERDS)
        </span>
        <Chip />
      </a>
    </>
  );
};
