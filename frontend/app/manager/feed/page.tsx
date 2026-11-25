import { TopBar } from "@/components/TopBar";
import { CampusCalendar } from "@/components/CampusCalendar";

export default function ManagerFeedPage() {
  return (
    <div>
      <TopBar title="Campus Feed" />
      <div className="px-4 pt-4">
        <CampusCalendar />
      </div>
    </div>
  );
}
