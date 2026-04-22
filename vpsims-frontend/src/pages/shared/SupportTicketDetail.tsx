import { useParams } from "react-router-dom";
import SupportWorkspace from "@/components/SupportWorkspace";
import { useAuth } from "@/contexts/AuthContext";

const SupportTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Determine role based on auth context
  const role = user?.role === 'Admin' ? 'Admin' : (user?.role === 'Staff' ? 'Staff' : 'Customer');

  return <SupportWorkspace role={role} initialSelectedId={parseInt(id || "0")} />;
};

export default SupportTicketDetail;
