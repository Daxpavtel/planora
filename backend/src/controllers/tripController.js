const tripService = require('../services/tripService');

exports.getTrips = async (req, res) => {
  try {
    // Step 9: Trust the token userId, not the client body
    const userId = req.user?.id || 'mock-user-id'; 
    const trips = await tripService.getAllTrips(userId);
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const userId = req.user?.id || 'mock-user-id';
    const trip = await tripService.getTripById(req.params.id, userId);
    if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized' });
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};
