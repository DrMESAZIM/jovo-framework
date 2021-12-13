import { AxiosError, JovoError } from '@jovotech/framework';
import { AlexaApiError, AlexaApiErrorCode, AlexaApiOptions, sendApiRequest } from './AlexaApi';

export interface AlertInfo {
  spokenInfo: {
    content: SpokenInfoContent[];
  };
}
export interface PushNotification {
  status: string; // if a push notification should be sent or not [default = ENABLED]
}

export interface Reminder {
  requestTime: string; // valid ISO 8601 format - describes the time when event actually occurred
  alertInfo: AlertInfo;
  pushNotification: PushNotification;
}
export interface RecurrenceWithFreq {
  freq: string;
  byDay?: string[];
}

export interface Trigger {
  timeZoneId?: string; // def
}
export type ReminderStatus = 'ON' | 'COMPLETED' | string;
export interface AbsoluteReminderTrigger extends Trigger {
  type: 'SCHEDULED_ABSOLUTE'; // Indicates type of trigger
  scheduledTime: string; // valid ISO 8601 format - Intended trigger time
  recurrence?: RecurrenceWithFreq | RecurrenceWithRules;
}

export interface RelativeReminderTrigger extends Trigger {
  type: 'SCHEDULED_RELATIVE'; // Indicates type of trigger
  offsetInSeconds: number;
}

export interface RecurrenceWithRules {
  startDateTime: string; // valid ISO 8601 format - Intended trigger time
  endDateTime: string;
  recurrenceRules: string[];
}
export interface AbsoluteReminder extends Reminder {
  trigger: AbsoluteReminderTrigger;
}

export interface RelativeReminder extends Reminder {
  trigger: RelativeReminderTrigger;
}

export interface ReminderResponse {
  alertToken: string;
  createdTime: string;
  updatedTime: string;
  status: ReminderStatus;
  trigger?: AbsoluteReminderTrigger | RelativeReminderTrigger;
  alertInfo?: AlertInfo;
  pushNotification?: PushNotification;
  version: string;
  href: string;
}
export interface Alert {
  alertToken: string;
  createdTime: string;
  updatedTime: string;
  status: ReminderStatus;
  trigger: AbsoluteReminderTrigger | RelativeReminderTrigger;
  alertInfo: AlertInfo;
  pushNotification: PushNotification;
  version: string;
}

export interface ReminderListResponse {
  totalCount: number;
  alerts: Alert[];
  links?: string;
}
interface SpokenInfoContent {
  locale: string; // locale in which value is specified
  text?: string; // text that will be used for display and spoken purposes
  ssml?: string;
}

export async function setReminder(
  reminder: AbsoluteReminder | RelativeReminder,
  apiEndpoint: string,
  permissionToken: string,
): Promise<ReminderResponse> {
  const options: AlexaApiOptions = {
    endpoint: apiEndpoint,
    path: '/v1/alerts/reminders',
    permissionToken,
    data: reminder,
    method: 'POST',
  };
  try {
    const response = await sendApiRequest<ReminderResponse>(options);
    return response.data;
  } catch (error) {
    handleReminderApiErrors(error);
  }
  throw new Error('Unexpected error.');
}

export async function updateReminder(
  alertToken: string,
  reminder: AbsoluteReminder | RelativeReminder,
  apiEndpoint: string,
  permissionToken: string,
): Promise<ReminderResponse> {
  const options: AlexaApiOptions = {
    endpoint: apiEndpoint,
    path: `/v1/alerts/reminders/${alertToken}`,
    permissionToken,
    data: reminder,
    method: 'PUT',
  };
  try {
    const response = await sendApiRequest<ReminderResponse>(options);
    return response.data;
  } catch (error) {
    handleReminderApiErrors(error);
  }
  throw new Error('Unexpected error.');
}

export async function deleteReminder(
  alertToken: string,
  apiEndpoint: string,
  permissionToken: string,
): Promise<ReminderResponse> {
  const options: AlexaApiOptions = {
    endpoint: apiEndpoint,
    path: `/v1/alerts/reminders/${alertToken}`,
    permissionToken,
    method: 'DELETE',
  };
  try {
    const response = await sendApiRequest<ReminderResponse>(options);
    return response.data;
  } catch (error) {
    handleReminderApiErrors(error);
  }
  throw new Error('Unexpected error.');
}

export async function getAllReminders(
  apiEndpoint: string,
  permissionToken: string,
): Promise<ReminderListResponse> {
  const options: AlexaApiOptions = {
    endpoint: apiEndpoint,
    path: '/v1/alerts/reminders',
    permissionToken,
    method: 'GET',
  };
  try {
    const response = await sendApiRequest<ReminderListResponse>(options);

    // The value for totalCount from the API is a string.
    return {
      ...response.data,
      totalCount: Number(response.data.totalCount), // Convert to number.
    };
  } catch (error) {
    handleReminderApiErrors(error);
  }
  throw new Error('Unexpected error.');
}

export async function getReminder(
  alertToken: string,
  apiEndpoint: string,
  permissionToken: string,
): Promise<ReminderResponse> {
  const options: AlexaApiOptions = {
    endpoint: apiEndpoint,
    path: `/v1/alerts/reminders/${alertToken}`,
    permissionToken,
    method: 'GET',
  };
  try {
    const response = await sendApiRequest<ReminderResponse>(options);
    return response.data;
  } catch (error) {
    handleReminderApiErrors(error);
  }
  throw new Error('Unexpected error.');
}

export function handleReminderApiErrors(error: AxiosError): Error | void {
  if (error.isAxiosError) {
    const { message, code } = error.response?.data;
    let errorCode: AlexaApiErrorCode = AlexaApiErrorCode.ERROR;

    if (error.response?.status === 401) {
      errorCode = AlexaApiErrorCode.NO_USER_PERMISSION;
    }

    if (
      code === AlexaApiErrorCode.DEVICE_NOT_SUPPORTED ||
      code === AlexaApiErrorCode.ALERT_NOT_FOUND
    ) {
      errorCode = code;
    }

    // User needs to grant access in app
    if (
      message === 'The authentication token is not valid.' ||
      message === 'Access to this resource has not yet been requested.' ||
      (code === 'ACCESS_DENIED' && message === 'Access denied with reason: ACCESS_NOT_REQUESTED')
    ) {
      errorCode = AlexaApiErrorCode.NO_USER_PERMISSION;
    }

    // Dev needs to set correct permissions in ASK console
    if (
      message === 'Access to this resource cannot be requested.' ||
      (code === 'ACCESS_DENIED' && message === 'Access denied with reason: FORBIDDEN')
    ) {
      errorCode = AlexaApiErrorCode.NO_SKILL_PERMISSION;
    }

    throw new AlexaApiError({ message, code: errorCode });
  }
  throw new JovoError({ message: error.message });
}
