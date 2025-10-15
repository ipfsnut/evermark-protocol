import { MiniAppNotificationDetails } from '@farcaster/miniapp-sdk';
import { APP_NAME } from './constants';

// In-memory storage for development
// In production, Railway will handle Redis externally via CLI
const localStore = new Map<string, MiniAppNotificationDetails>();

function getUserNotificationDetailsKey(fid: number): string {
  return `${APP_NAME}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  const key = getUserNotificationDetailsKey(fid);
  return localStore.get(key) || null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  const key = getUserNotificationDetailsKey(fid);
  localStore.set(key, notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  const key = getUserNotificationDetailsKey(fid);
  localStore.delete(key);
}
