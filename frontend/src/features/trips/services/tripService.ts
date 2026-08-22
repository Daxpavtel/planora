import { Trip } from '@/types/models';
import { trips } from '@/services/mocks';

export const tripService = {
  getTrips: async (): Promise<Trip[]> => {
    return Promise.resolve(trips);
  },
  getTrip: async (id: string): Promise<Trip | undefined> => {
    return Promise.resolve(trips.find(t => t.id === id));
  }
};
