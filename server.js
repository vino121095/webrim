const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/db.js');
require('dotenv').config(); 
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors({ 
  origin: ['https://rimhub.in', 'https://web.rimhub.in', 'http://localhost:3000', 'https://cdn-api.co-vin.in', 'https://api.opencagedata.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Allow credentials if needed
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

// app.get('/test', async (req, res) => {

//   // Create the transporter
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: 'vinothini1.deecodes@gmail.com',
//       pass: 'setp kpsv zzun xesv', // App-specific password
//     },
//   });

//   // Email options
//   const mailOptions = {
//     from: 'vinothini1.deecodes@gmail.com',
//     to: 'vinothinivm31@gmail.com',
//     subject: 'Your Registration Request Update',
//     html: `
// <p style="font-family: Arial, sans-serif;">Dear ,</p>
// <p style="font-family: Arial, sans-serif;">We regret to inform you that your registration request has been rejected.</p>
// <p style="font-family: Arial, sans-serif;">Reason for rejection: <strong></strong></p>
// <p style="font-family: Arial, sans-serif;">We appreciate your interest in our platform and encourage you to reach out if you have any further questions or concerns.</p>
// <p style="font-family: Arial, sans-serif;">Best regards,<br/>The Team at eNool</p>
// `
// };
// console.log(mailOptions)
// });

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

const AdminRoutes = require('./routes/AdminRoutes.js');
app.use('/api', AdminRoutes);

// Email Authentication Routes
const EmailRoutes = require('./routes/EmailRoutes.js');
app.use('/api', EmailRoutes);

// Listen on the port from the .env file
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
