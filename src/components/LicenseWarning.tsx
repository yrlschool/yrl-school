import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XCircle, X } from "lucide-react";
import { getDaysUntilExpiry, isLicenseExpired, hasActivationData } from "@/lib/schoolSettings";
import { Link } from "react-router-dom";

const LicenseWarning = () => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDaysLeft(getDaysUntilExpiry());
    setExpired(isLicenseExpired());
    setHasData(hasActivationData());
  }, []);

  // Don't show if dismissed, no activation data, or more than 30 days left
  if (dismissed || !hasData || (daysLeft !== null && daysLeft > 30 && !expired)) {
    return null;
  }

  // Expired license
  if (expired) {
    return (
      <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-pulse">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-destructive">انتهت صلاحية الترخيص!</h3>
            <p className="text-sm text-destructive/80 mt-1">
              يرجى التواصل مع المطور للحصول على ترخيص جديد. بعض الميزات قد لا تعمل بشكل صحيح.
            </p>
            <Link 
              to="/contact" 
              className="inline-block mt-2 text-sm font-medium text-destructive underline"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Warning if less than 30 days
  if (daysLeft !== null && daysLeft <= 30) {
    const isUrgent = daysLeft <= 7;
    
    return (
      <div className={`mb-4 p-4 rounded-xl border relative ${
        isUrgent 
          ? "bg-destructive/10 border-destructive/30" 
          : "bg-warning/10 border-warning/30"
      }`}>
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-2 left-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-start gap-3">
          {isUrgent ? (
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`font-bold ${isUrgent ? "text-destructive" : "text-warning"}`}>
              {isUrgent ? "تنبيه عاجل!" : "تنبيه"}
            </h3>
            <p className={`text-sm mt-1 ${isUrgent ? "text-destructive/80" : "text-warning/80"}`}>
              {daysLeft === 0 
                ? "ينتهي الترخيص اليوم!"
                : daysLeft === 1 
                  ? "ينتهي الترخيص غداً!"
                  : `متبقي ${daysLeft} يوم على انتهاء الترخيص`
              }
            </p>
            <Link 
              to="/contact" 
              className={`inline-block mt-2 text-sm font-medium underline ${
                isUrgent ? "text-destructive" : "text-warning"
              }`}
            >
              تجديد الترخيص
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LicenseWarning;
