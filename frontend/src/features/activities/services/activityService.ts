import { Activity } from '@/types/models';
import { activities } from '@/services/mocks';

export const activityService = {
  getActivities: async (): Promise<Activity[]> => {
    return Promise.resolve(activities);
  }
};
