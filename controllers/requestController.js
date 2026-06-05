const BreakdownRequest = require('../models/BreakdownRequest');
const Workshop = require('../models/Workshop');
const { calculateDistance } = require('../utils/geoUtils');

exports.createRequest = async (req, res) => {
  try {
    const { vehicleId, problemType, description, lat, lng, address } = req.body;
    
    // 1. Create Request
    const newRequest = await BreakdownRequest.create({
      userId: req.user.id,
      vehicleId,
      problemType,
      description,
      breakdownLocation: { lat, lng, address },
      status: 'pending'
    });

    // 2. Find Nearby Available Workshops (Default radius 10km)
    const RADIUS_KM = process.env.WORKSHOP_SEARCH_RADIUS_KM || 10;
    
    // Find all online & approved workshops
    const availableWorkshops = await Workshop.find({
      isApproved: true,
      isAvailable: true,
      isBlocked: false
    });

    const nearbyWorkshops = availableWorkshops.filter(ws => {
      const dist = calculateDistance(lat, lng, ws.location.lat, ws.location.lng);
      return dist <= RADIUS_KM;
    });

    // 3. Emit via Socket.io
    // Broadcast 'new:breakdown_request' to the specific workshop rooms
    nearbyWorkshops.forEach(ws => {
      req.io.to(ws._id.toString()).emit('new:breakdown_request', {
        request: newRequest,
        distance: calculateDistance(lat, lng, ws.location.lat, ws.location.lng).toFixed(1)
      });
    });

    res.status(201).json({
      message: 'SOS Request created. Alerting nearby workshops.',
      request: newRequest,
      workshopsAlerted: nearbyWorkshops.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await BreakdownRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['inprogress', 'completed'].includes(request.status)) {
      return res.status(400).json({ message: 'Cannot cancel request at this stage' });
    }

    request.status = 'cancelled';
    request.cancelReason = reason;
    await request.save();

    // Notify workshop if assigned
    if (request.workshopId) {
      req.io.to(request.workshopId.toString()).emit('request:cancelled_by_user', { requestId: id });
    }

    res.status(200).json({ message: 'Request cancelled successfully', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNearbyWorkshops = async (req, res) => {
  res.status(200).json({ message: 'getNearbyWorkshops endpoint' });
};
