import { useState } from "react";
import { QrCode, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SCHOOL_NAME, APP_NAME } from "@/lib/config";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(onComplete, 500);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(217 91% 25%) 0%, hsl(262 83% 35%) 50%, hsl(222 47% 11%) 100%)",
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
                  background: `hsl(${217 + Math.random() * 45} 80% 70% / 0.3)`,
                }}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  scale: 0,
                }}
                animate={{
                  y: [null, Math.random() * -300 - 100],
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Glowing circles */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(217 91% 60% / 0.2) 0%, transparent 60%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(262 83% 58% / 0.25) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="relative"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-amber-400" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
              {APP_NAME}
            </h1>
            <p className="text-lg sm:text-2xl text-blue-200 mb-2">
              {SCHOOL_NAME}
            </p>
            <motion.p
              className="text-base text-purple-300/70"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              نظام تسجيل الحضور
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-12 sm:bottom-16"
          >
            <motion.p
              className="text-blue-300/50 text-sm sm:text-base"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              اضغط في أي مكان للدخول
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
