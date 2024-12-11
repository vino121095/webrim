const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/db.js');
require('dotenv').config(); 
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors({ 
  origin: '*' 
  // origin: 'https://develop.rimhub.in'
}));

// Define the path for the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');

// Function to create the uploads directory if it doesn't exist
const createUploadsDir = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Uploads directory created:', uploadsDir);
    } else {
        console.log('Uploads directory already exists:', uploadsDir);
    }
};

createUploadsDir();

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

app.use(
  session({
    secret: process.env.ACCESS_SECRET_TOKEN, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  })
);

(async () => {
    await db.sync();
    console.log('Table created successfully');
})();

// Root route
app.get('/', (req, res) => {
    res.send('Welcome');
});

// Post route
app.post('/', (req, res) => {
    res.send('Post request submitted');
});

// Product Route
const ProductRoutes = require('./routes/productRoutes.js');
app.use('/api', ProductRoutes);

// User routes
const UserRoutes = require('./routes/userRoutes.js');
app.use('/api', UserRoutes);

// Distributors routes
const DistributorRoutes = require('./routes/distributorRoutes.js');
app.use('/api', DistributorRoutes);

// Cart routes
const AddToCartRoutes = require('./routes/AddToCartRoutes.js');
app.use('/api', AddToCartRoutes);

// Forum routes
const ForumRoutes = require('./routes/ForumRoutes.js');
app.use('/api', ForumRoutes);

// Transport Route
const TransportRoutes = require('./routes/transportRoute.js');
app.use('/api', TransportRoutes);

// Shipment Route
const ShipmentRoutes = require('./routes/shipmentRoute.js');
app.use('/api', ShipmentRoutes);

// Orders Route
const OrderRoutes = require('./routes/orderRoutes.js');
app.use('/api', OrderRoutes);

//Location Route
const LocationRoutes = require('./routes/LocationRoutes.js');
app.use('/api', LocationRoutes);


// Listen on the port from the .env file
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
