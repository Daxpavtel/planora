const prisma = require('../utils/prismaClient');

const tripService = {
  getAllTrips: async (userId) => {
    return await prisma.trip.findMany({
      where: { userId }, // Security: Only fetch this user's trips
      include: { destinations: true, activities: true, expenses: true }
    });
  },
  
  getTripById: async (id, userId) => {
    return await prisma.trip.findUnique({
      where: { id, userId }, // Security: Must belong to user
      include: { destinations: true, activities: true, expenses: true }
    });
  }
};

module.exports = tripService;
