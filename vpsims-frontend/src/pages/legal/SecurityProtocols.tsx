import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Key, Database, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SecurityProtocols = () => {
  const navigate = useNavigate();

  const protocols = [
    {
      title: "1. Access Control (RBAC)",
      icon: Lock,
      content: "The system implements strict Role-Based Access Control. Users are granted permissions based on their verified role (Admin, Staff, or Client). Unauthorized attempts to access administrative endpoints are automatically flagged and recorded."
    },
    {
      title: "2. Data Encryption & Integrity",
      icon: Database,
      content: "All sensitive data, including passwords and payment information, is encrypted using industry-standard AES-256 and SHA-256 hashing. Data in transit is protected via TLS 1.3 encryption to prevent interception."
    },
    {
      title: "3. Audit Logging & Monitoring",
      icon: Eye,
      content: "VPSIMS maintains an immutable audit trail of all system activities. Every login attempt, database modification, and financial transaction is logged with a timestamp and associated user ID for forensic review."
    },
    {
      title: "4. Password & Authentication",
      icon: Key,
      content: "Multi-factor authentication (MFA) is mandatory for administrative accounts. Regular users must adhere to strict password complexity requirements and are required to rotate credentials every 90 days."
    },
    {
      title: "5. Incident Response",
      icon: AlertCircle,
      content: "In the event of a security breach or suspicious activity, the system automatically revokes affected sessions and notifies the security administrator. A full security audit is performed after every major deployment."
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
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Protocols</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Advanced protection systems for VPSIMS infrastructure</p>
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
          {protocols.map((protocol, idx) => (
            <section key={idx} className="flex gap-6">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <protocol.icon size={20} />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{protocol.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {protocol.content}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Confidential Document. Distribution of these protocols outside the VPSIMS environment is strictly prohibited.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityProtocols;
