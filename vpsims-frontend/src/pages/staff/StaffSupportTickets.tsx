import SupportWorkspace from "@/components/SupportWorkspace";
import { useParams } from "react-router-dom";

const StaffSupportTickets = () => {
  const { id } = useParams();
  return <SupportWorkspace role="Staff" initialSelectedId={id ? parseInt(id) : undefined} />;
};

export default StaffSupportTickets;
