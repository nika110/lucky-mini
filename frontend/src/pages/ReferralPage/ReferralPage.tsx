import Navbar from "@/components/features/Navbar/Navbar";
import Referrals from "@/components/features/Referrals/Referrals";

import { FC } from "react";

const ReferallsPage: FC = () => {
  return (
    <div>
      <Referrals />
      <Navbar />
    </div>
  );
};

export default ReferallsPage;
