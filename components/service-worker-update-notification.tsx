"use client";

import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useTranslation } from "@/lib/i18n";
import { SettingsManager } from "@/lib/settings";

const ServiceWorkerUpdateNotification: React.FC = () => {
  const { toast } = useToast();
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const settings = SettingsManager.getSettings();
  const { t } = useTranslation(settings.language);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const onUpdateFound = (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowUpdateNotification(true);
            setWaitingWorker(newWorker);
          }
        });
      }
    };

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => onUpdateFound(registration));
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdateNotification(true);
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (showUpdateNotification) {
        window.location.reload();
      }
    });

  }, [showUpdateNotification]);

  useEffect(() => {
    if (showUpdateNotification) {
      toast({
        title: t('updateAvailableTitle'),
        description: t('updateAvailableDescription'),
        action: (
          <Button
            variant="outline"
            onClick={() => {
              if (waitingWorker) {
                waitingWorker.postMessage({ type: 'SKIP_WAITING' });
              }
              window.location.reload();
            }}
          >
            {t('updateButton')}
          </Button>
        ),
        duration: Infinity,
      });
    }
  }, [showUpdateNotification, waitingWorker, toast, t]);

  return null;
};

export default ServiceWorkerUpdateNotification;
