import { FC, useLayoutEffect, useRef, useState } from "react";
import cl from "./Referrals.module.css";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { TicketIcon } from "@/components/shared/UI/Icons/TicketIcon";
import { Button } from "@/components/shared/UI/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/shared/UI/drawerCustom";
import { QRCodeSVG } from "qrcode.react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import bs58 from "bs58";
import gsap from "gsap";
import { useGetUserReferralListQuery } from "@/redux/services/user.api";
// import { ArrowRightIcon } from "@/components/shared/UI/Icons/ArrowRight";
import { XPIcon } from "@/components/shared/UI/Icons/XPIcon";
import { ReferralUser } from "@/types/user";

const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_BOT_NAME;
const TELEGRAM_MINI_APP_NAME = import.meta.env.VITE_WEB_APP_NAME;

const Referrals: FC = () => {
  const { user } = useTelegramUser();
  const frensRef = useRef<HTMLDivElement>(null);

  const { data: referrals, isSuccess } = useGetUserReferralListQuery(
    {
      telegramId: user ? user.telegram_id : "",
    },
    { skip: !user }
  );

  useLayoutEffect(() => {
    const element = frensRef.current;
    if (element) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          element.querySelector("#frensInfo"),
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power4.inOut" }
        );
        gsap.fromTo(
          element.querySelector("#frensList"),
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power4.inOut" }
        );
        gsap.fromTo(
          element.querySelector("#frensArt"),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.65, delay: 0.5, ease: "power4.inOut" }
        );
      });

      return () => ctx.revert();
    }
  }, []);

  return (
    <section ref={frensRef} className={`pt-10 ${cl.section}`}>
      <div className="container">
        <img
          id="frensArt"
          src="/frens-art-full.svg"
          className="w-[191px] h-[100px] block m-auto"
        />

        <div id="frensInfo" className="relative mb-4">
          <PixelWrapper width={3} color="gray" />
          <div className="bg-inkwell pt-6 px-4 pb-4">
            <h1 className="text-lg px-5 text-center uppercase mb-4">
              Invite frens And earn points
            </h1>
            <p className="text-center uppercase text-rock mb-4 text-base">
              How it Works?
            </p>
            <ul className="relative overflow-hidden flex flex-col gap-4">
              <li className="relative flex justify-start items-center gap-3 w-full text-sm uppercase leading-4">
                <div className="relative w-[12px] h-[12px] bg-corn">
                  <div className="absolute top-[-50px] left-0 w-full h-[50px] bg-inkwell" />
                  <div className="absolute top-0 left-[4px] w-[4px] h-[120px] bg-corn" />
                </div>
                <div className="w-full flex flex-col">
                  <p>share your invitation link</p>
                  <p className="text-rock">
                    Get a&nbsp;
                    <span>
                      <TicketIcon className="inline" />
                    </span>
                    &nbsp;play pass for each fren!
                  </p>
                </div>
              </li>

              {/* asdasdsadsad */}
              <li className="flex justify-start items-center gap-3 w-full text-sm uppercase leading-4">
                <div className="w-[12px] h-[12px] bg-corn" />
                <div className="w-full flex flex-col">
                  <p>Your friends join us</p>
                  <p className="text-rock">and start playing</p>
                </div>
              </li>
              <li className="flex justify-start items-center gap-3 w-full text-sm uppercase leading-4">
                <div className="relative w-[12px] h-[12px] bg-corn">
                  <div className="absolute top-[12px] left-[4px] w-[4px] h-[120px] bg-inkwell" />
                </div>
                <div className="w-full flex flex-col">
                  <p>SCORE 10% from each winning</p>
                </div>
              </li>
            </ul>
            {user ? (
              <ReferralsInvite referralCode={user.telegram_id} />
            ) : (
              <div className="flex justify-center mt-5">
                <Button className="max-w-[205px] w-full">INVITE FREN</Button>
              </div>
            )}
          </div>
        </div>
        {/* LIST OF FRENS */}
        <div id="frensList" className="relative mb-4">
          <PixelWrapper width={3} color="gray" />
          <div className="bg-inkwell pt-6 px-4 pb-4">
            <h1 className="text-lg px-5 text-center uppercase mb-4">
              LIST OF Frens
            </h1>
            {isSuccess &&
            referrals &&
            referrals.data.referrals.length > 0 ? (
              <ReferralsList referrals={referrals.data.referrals} />
            ) : isSuccess && referrals ? (
              <p className="text-center uppercase text-rock text-sm mt-8 mb-7">
                There are no frens yet...
              </p>
            ) : (
              <p className="text-center uppercase text-rock text-sm mt-8 mb-7">
                Loading...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface ReferralsListProps {
  referrals: ReferralUser[];
}

export const ReferralsList: FC<ReferralsListProps> = ({ referrals }) => {
  return (
    <div className="relative mb-3">
      <ul className="relative overflow-hidden flex flex-col gap-4">
        {referrals.map((referral) => (
          <li className="relative flex justify-between items-center gap-3 w-full text-base uppercase leading-4">
            <span className="absolute left-0 right-0 top-0 bottom-0 z-[1] m-auto bg-liquor h-[1px]" />
             <p className="relative z-10 flex justify-start text-white bg-inkwell pr-2.5">
              <span className="text-rock">ID:</span>
              <span>{referral.telegram_id}</span>
            </p>
            <p className="relative z-10 pl-2.5 flex justify-end items-center gap-2 bg-inkwell ">
              <span>{referral.xp}</span>
              <XPIcon className="!w-4 !h-4"/>
            </p>
          </li>
        ))}
      </ul>
      {/* <div className="flex mt-4 mb-1 justify-center items-center gap-3">
        <Button variant={"ghost"}>
          <ArrowRightIcon className="rotate-180" />
        </Button>
        <Button variant={"ghost"}>
          <ArrowRightIcon className="" />
        </Button>
      </div> */}
    </div>
  );
};

interface ReferralsInviteProps {
  referralCode: string;
}

export const ReferralsInvite: FC<ReferralsInviteProps> = ({ referralCode }) => {
  const [isOpenSelect, setIsOpenSelect] = useState(false);

  const referralData = bs58.encode(
    Buffer.from(JSON.stringify({ referralCode }))
  );
  const referralLink = `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_MINI_APP_NAME}?startapp=${referralData}`;

  const sendReferralLink = () => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${referralLink}&text=${encodeURIComponent(
          "Join me on LuckyFi and let's earn together! Use my invite link to join the fun."
        )}`
      );
    }
  };

  const copyReferralLink = () => {
    toast.success("Referral Link Copied to Clipboard");
  };

  return (
    <Drawer
      isOpen={isOpenSelect}
      onClose={() => setIsOpenSelect(false)}
      onOpen={() => setIsOpenSelect(true)}
    >
      <DrawerTrigger className="w-full">
        <div className="flex justify-center mt-5">
          <Button className="max-w-[205px] w-full">INVITE FREN</Button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="pb-20 container">
          <h2 className="text-center text-base leading-5 uppercase mx-auto mb-4 max-w-[260px]">
            INVITE A FREN
          </h2>
          <PixelQRCode value={referralLink} />
          <div className="grid grid-cols-2 gap-3 px-5">
            <Button className="max-w-full" onClick={sendReferralLink}>
              Send
            </Button>
            <CopyToClipboard text={referralLink} onCopy={copyReferralLink}>
              <Button className="max-w-full">Copy Link</Button>
            </CopyToClipboard>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const PixelQRCode: FC<{ value: string }> = ({ value }) => (
  <div className="flex justify-center mb-6">
    <div className="p-4" style={{ background: "transparent" }}>
      <QRCodeSVG
        value={value}
        size={275}
        level="L"
        fgColor="#FFFFFF"
        bgColor="transparent"
        imageSettings={{
          src: "/logo-square.png",
          x: undefined,
          y: undefined,
          height: 72,
          width: 72,
          excavate: true,
        }}
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  </div>
);

export default Referrals;
