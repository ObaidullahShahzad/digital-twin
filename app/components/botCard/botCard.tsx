"use client"; // Add this directive for Client Components
import { useRouter } from "next/navigation"; // Updated import
import { motion } from "framer-motion";

interface RecordingConfig {
  [key: string]: string | number | boolean | null | undefined;
}

interface Bot {
  id: string;
  name: string;
  description: string;
  calendar_id: string;
  recording_config?: RecordingConfig;
  status: "active" | "inactive";
}

interface BotCardProps {
  bot: Bot;
}

const BotCard: React.FC<BotCardProps> = ({ bot }) => {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-xl p-6 shadow-lg cursor-pointer transition-all duration-300 border border-gray-100 hover:border-blue-500"
      onClick={() => router.push(`/bot/${bot.id}`)}
    >
      <h3 className="text-xl font-semibold text-gray-800">{bot.name}</h3>
      <p className="text-gray-600 mt-2">{bot.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            bot.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {bot.status}
        </span>
        <span className="text-blue-600 font-medium">View Details →</span>
      </div>
    </motion.div>
  );
};

export default BotCard;
