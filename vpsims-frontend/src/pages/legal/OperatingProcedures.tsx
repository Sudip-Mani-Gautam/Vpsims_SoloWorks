import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, ShieldCheck, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OperatingProcedures = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Inventory Control & Procurement",
      icon: BookOpen,
      content: "All vehicle parts and components must be cataloged with accurate serial numbers and SKU identifiers. Procurement from external vendors requires authorization from administrative personnel. Staff are responsible for maintaining real-time stock accuracy through the digital management portal."
    },
    {
      title: "2. Service & Maintenance Workflow",
      icon: Settings,
      content: "Service appointments must be logged via the appointment system. Technical staff must document all diagnostic findings and replaced parts. Every service transaction must result in a system-generated invoice to ensure financial transparency."
    },
    {
      title: "3. Customer Data Management",
      icon: FileText,
      content: "Client records, including vehicle history and contact information, are strictly confidential. Staff may only access customer data necessary for performing their assigned duties. Any data modification must be logged for audit purposes."
    },
    {
      title: "4. Financial Operations",
      icon: CheckCircle2,
      content: "All payments must be processed through the integrated secure payment gateway. Manual adjustments to invoices or loyalty points require dual-authorization from senior management. Weekly financial audits are performed automatically by the system."
    }
  ];

  return (
    <div className="lp-root bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full mx-auto bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden my-12"
      >
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Operating Procedures</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Standardized workflows for VPSIMS operations</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Portal
          </button>
        </div>

        <div className="p-8 space-y-8">
          {sections.map((section, idx) => (
            <section key={idx} className="flex gap-6">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <section.icon size={20} />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Last Updated: April 30, 2026. These procedures are binding for all authorized users of the VPSIMS platform.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatingProcedures;
