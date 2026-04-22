import SupportWorkspace from "@/components/SupportWorkspace";
import { useParams } from "react-router-dom";

const CustomerSupportPage = () => {
  const { id } = useParams();
  return <SupportWorkspace role="Customer" initialSelectedId={id ? parseInt(id) : undefined} />;
};

export default CustomerSupportPage;
