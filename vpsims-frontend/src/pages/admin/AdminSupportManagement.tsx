import SupportWorkspace from "@/components/SupportWorkspace";
import { useParams } from "react-router-dom";

const AdminSupportManagement = () => {
  const { id } = useParams();
  return <SupportWorkspace role="Admin" initialSelectedId={id ? parseInt(id) : undefined} />;
};

export default AdminSupportManagement;
