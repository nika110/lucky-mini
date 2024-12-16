import {
  FC,
  // useEffect
} from "react";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { useSearchParams } from "react-router-dom";
// import { ROUTES } from "@/routes/routes";
// import {
//   useConnectWalletMutation,
//   useInitializeSignMessageMutation,
// } from "@/redux/services/wallet.api";
// import { DEEP_LINKS } from "@/utils/phantom";

const ConnectSolPage: FC = () => {
  const [searchParams] = useSearchParams();
  // const userIdQuery = searchParams.get("userId");
  // const webAppDataQuery = searchParams.get("tgWebAppData");
  // const appUrl = searchParams.get("appUrl");
  // const errorCode = searchParams.get("errorCode");
  const phantomPublicKey = searchParams.get("phantom_encryption_public_key");
  // const appPublicKey = searchParams.get("app_encryption_public_key");
  // const nonce = searchParams.get("nonce");
  // const dataConnect = searchParams.get("data");

  // const [connectWallet] = useConnectWalletMutation();
  // const [initiSignMessage] = useInitializeSignMessageMutation();

  // useEffect(() => {
  //   const handleSignMessage = async () => {
  //     if (!phantomPublicKey || !appPublicKey || !userIdQuery || !dataConnect || !nonce) return;

  //     connectWallet({
  //       telegramId: userIdQuery,
  //       phantom_encryption_public_key: phantomPublicKey,
  //       nonce,
  //       data: dataConnect,
  //     })
  //       .unwrap()
  //       .then((res) => {
  //         if (res.data && "success" in res && res.success) {
  //           // INITI SIGN MESSAGE
  //           initiSignMessage({
  //             telegramId: userIdQuery,
  //           })
  //             .unwrap()
  //             .then((res) => {
  //               if (res.data && "success" in res && res.success) {
  //                 const { payload, nonce: signNonce } = res.data;

  //                 const signMessageUrl = new URL(DEEP_LINKS.SIGN_MESSAGE);
  //                 signMessageUrl.searchParams.set("nonce", signNonce);
  //                 signMessageUrl.searchParams.set(
  //                   "dapp_encryption_public_key",
  //                   appPublicKey
  //                 );
  //                 signMessageUrl.searchParams.set(
  //                   "redirect_link",
  //                   `${window.location.origin}${ROUTES.SIGN_SOL}/?userId=${userIdQuery}&appUrl=${appUrl}`
  //                 );
  //                 signMessageUrl.searchParams.set("payload", payload);
  //                 alert(signMessageUrl.toString());
  //                 window.location.href = signMessageUrl.toString();
  //               }
  //             })
  //             .catch((err) => {
  //               alert(JSON.stringify(err));
  //             });
  //         }
  //       })
  //       .catch((err) => {
  //         alert(JSON.stringify(err));
  //       });
  //   };

  //   if (phantomPublicKey && !errorCode && dataConnect) {
  //     handleSignMessage();
  //   } else if (errorCode || !userIdQuery || !webAppDataQuery || !appUrl) {
  //     alert("Something went wrong, please try again");
  //   }
  // }, [
  //   phantomPublicKey,
  //   appPublicKey,
  //   userIdQuery,
  //   webAppDataQuery,
  //   appUrl,
  //   errorCode,
  //   dataConnect,
  //   nonce,
  //   connectWallet,
  //   initiSignMessage,
  // ]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-0 w-full flex justify-center items-center">
        <LogoFull />
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex justify-center mb-5">
          <CubesLoading />
        </div>

        <h1 className="text-xl">
          {phantomPublicKey
            ? "Requesting signature..."
            : "Establishing connection..."}
        </h1>

        <p className="text-sm text-dim leading-[14px] max-w-[300px]">
          {phantomPublicKey
            ? "Please sign the message in your Phantom wallet to complete verification"
            : "Please wait while we connect to your Solana wallet"}
        </p>
      </div>
    </div>
  );
};

export default ConnectSolPage;
