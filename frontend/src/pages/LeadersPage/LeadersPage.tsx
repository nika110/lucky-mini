import Leaderboard from "@/components/features/Leaderboard/Leaderboard";
import Navbar from "@/components/features/Navbar/Navbar";
import { FC } from "react";

const LeadersPage: FC = () => {
  return (
    <div>
      <Leaderboard />
      <Navbar />
    </div>
  );
};

export default LeadersPage;
