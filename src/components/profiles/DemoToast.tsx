/**
 * DemoToast — lightweight toast for demo actions on the profiles pages
 * (no global Toaster is mounted in the scaffold, so pages render their own).
 * Usage: const { toast, show } = useDemoToast(); ... {toast}
 */
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function useDemoToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 4000);
  }, []);

  const toast = (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-[70] flex h-12 -translate-x-1/2 items-center gap-2 rounded-lg bg-ink-950 px-4 text-[13px] font-semibold text-white shadow-lg md:bottom-6"
        >
          <CheckCircle2 size={16} className="text-brand-500" aria-hidden />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { toast, show };
}
