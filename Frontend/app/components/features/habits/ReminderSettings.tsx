import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Icon } from '~/components/ui/Icon';
import {
  disablePushNotifications,
  enablePushNotifications,
  sendTestPushNotification,
  syncExistingPushSubscription,
} from '~/lib/notifications';

export default function ReminderSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [working, setWorking] = useState<
    'enable' | 'disable' | 'test' | null
  >(null);

  const [permission, setPermission] =
    useState<NotificationPermission | 'unsupported'>('default');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    async function checkSupport() {
      const supported =
        typeof window !== 'undefined' &&
        window.isSecureContext &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      if (!supported) {
        setIsSupported(false);
        setPermission('unsupported');
        setIsChecking(false);
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      try {
        const enabled = await syncExistingPushSubscription();

        if (active) {
          setIsEnabled(enabled);
        }
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Unable to check this device subscription.',
          );
        }
      } finally {
        if (active) setIsChecking(false);
      }
    }

    void checkSupport();

    return () => {
      active = false;
    };
  }, []);

  async function handleEnable() {
    setWorking('enable');
    setError('');
    setNotice('');

    try {
      await enablePushNotifications();

      setIsEnabled(true);
      setPermission(Notification.permission);
      setNotice(
        'Push reminders are enabled on this device. Set a reminder time on a habit to receive reminders.',
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to enable push reminders.',
      );
    } finally {
      setWorking(null);
    }
  }

  async function handleDisable() {
    setWorking('disable');
    setError('');
    setNotice('');

    try {
      await disablePushNotifications();
      setIsEnabled(false);
      setNotice('Push reminders disabled on this device.');
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to disable push reminders.',
      );
    } finally {
      setWorking(null);
    }
  }

  async function handleTest() {
    setWorking('test');
    setError('');
    setNotice('');

    try {
      const result = await sendTestPushNotification();

      setNotice(
        `Test notification sent to ${result.sent ?? 1} subscription(s).`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to send a test notification.',
      );
    } finally {
      setWorking(null);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon name="bell" size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Push reminders
            </h2>

            <p className="mt-0.5 max-w-xl text-xs text-[var(--text-3)]">
              Receive browser notifications for scheduled habits, including when
              the app tab is closed.
            </p>

            <p className="mt-1 font-mono text-[10px] text-[var(--text-3)]">
              {!isSupported
                ? 'This browser or connection does not support push notifications.'
                : isChecking
                  ? 'Checking this device…'
                  : isEnabled
                    ? `Enabled on this device. Browser permission: ${permission}.`
                    : `Not enabled on this device. Browser permission: ${permission}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          {isEnabled ? (
            <>
              <Button
                variant="secondary"
                disabled={Boolean(working) || isChecking}
                onClick={() => void handleTest()}
              >
                {working === 'test' ? 'Sending…' : 'Test reminder'}
              </Button>

              <Button
                variant="secondary"
                disabled={Boolean(working) || isChecking}
                onClick={() => void handleDisable()}
              >
                {working === 'disable' ? 'Disabling…' : 'Disable'}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              disabled={!isSupported || isChecking || Boolean(working)}
              onClick={() => void handleEnable()}
            >
              {working === 'enable' || isChecking
                ? 'Enabling…'
                : 'Enable reminders'}
            </Button>
          )}
        </div>
      </div>

      {(error || notice) && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
            error
              ? 'border-red-500/20 bg-red-500/10 text-red-600'
              : 'border-green-500/20 bg-green-500/10 text-green-700'
          }`}
          role={error ? 'alert' : 'status'}
        >
          {error || notice}
        </div>
      )}
    </section>
  );
}
