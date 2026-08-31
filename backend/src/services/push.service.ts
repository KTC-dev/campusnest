import { env } from "../config/env";

class PushService {
  async sendToDevice(deviceToken: string, title: string, body: string, data?: Record<string, string>) {
    if (!env.FCM_SERVER_KEY) {
      console.warn("[Push] FCM not configured, skipping push notification");
      return;
    }

    try {
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${env.FCM_SERVER_KEY}`,
        },
        body: JSON.stringify({
          to: deviceToken,
          notification: { title, body },
          data: data ?? {},
        }),
      });

      if (!response.ok) {
        console.error("[Push] FCM error:", await response.text());
      }
    } catch (error) {
      console.error("[Push] Failed to send:", error);
    }
  }
}

export const pushService = new PushService();
