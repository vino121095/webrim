const axios = require('axios');

exports.fetchStates = async (req, res) => {
  try {
    const response = await axios.get('https://cdn-api.co-vin.in/api/v2/admin/location/states');
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from CoWIN API:", error);
    res.status(500).json({ error: 'Failed to fetch data from CoWIN API' });
  }
};

exports.fetchDistricts = async (req, res) => {
  const stateId = req.params.id;

  try {
    const response = await axios.get(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
};

