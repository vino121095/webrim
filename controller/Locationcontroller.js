
exports.fetchStates = async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://cdn-api.co-vin.in/api/v2/admin/location/states');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

exports.fetchDistricts = async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const stateId = req.params.id;
    const response = await fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
};

