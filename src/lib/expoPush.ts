import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export async function sendExpoPush(
    tokens: string[],
    message: { title: string; body: string; data?: any }
): Promise<void> {
    if (!tokens || tokens.length === 0) return;
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
    if (validTokens.length === 0) return;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
        to: token,
        sound: "default",
        title: message.title,
        body: message.body,
        data: message.data || {}
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
        try {
            await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
            console.error("Failed to send Expo push chunk", error);
        }
    }
}
