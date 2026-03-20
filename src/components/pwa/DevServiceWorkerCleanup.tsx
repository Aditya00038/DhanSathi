"use client";

import { useEffect } from "react";

export default function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let isMounted = true;

    const cleanup = async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
      }

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

        if (isMounted) {
          console.info("[PWA] Dev cleanup completed: unregistered service workers and cleared caches.");
        }
      } catch (error) {
        console.warn("[PWA] Dev cleanup failed:", error);
      }
    };

    cleanup();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
