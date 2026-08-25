/**
 * DemoToast — lightweight bottom toast (design.md 7.15) for demo actions
 * ("Pesquisa guardada", "A seguir X", …) without requiring a global Toaster.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function useDemoToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const toast = useCallback((message: string) => {
    setMsg(message);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 4000);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const node = (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-[70] flex h-12 -translate-x-1/2 items-center gap-2 rounded-lg bg-ink-950 px-4 text-white shadow-lg md:bottom-6"
        >
          <CheckCircle2 size={18} className="shrink-0 text-brand-500" aria-hidden />
          <span className="whitespace-nowrap text-[13px] font-semibold">{msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { toast, toastNode: node };
}
