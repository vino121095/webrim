// const nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const User = require('../model/UserModel');
// const { where } = require('sequelize');

// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

// // In production, use Redis or a database to store OTPs
// const otpStore = new Map(); // { email: { otp: string, timestamp: number } }

// function generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000);
// }

// function isOTPExpired(timestamp) {
//     const now = Date.now();
//     const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
//     return now - timestamp > tenMinutes;
// }

// exports.sendOTP = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({
//             where:{
//                 email:email
//             }
//         })
//         if(!user){
//             return res.json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         if (!EMAIL_USER || !EMAIL_PASS) {
//             throw new Error('Email credentials not configured');
//         }

//         // Generate new OTP
//         const otp = generateOTP();
        
//         // Store OTP first
//         otpStore.set(email, {
//             otp: otp,
//             email:email,
//             timestamp: Date.now()
//         });

//         // Create transporter with connection pool
//         const transporter = nodemailer.createTransport({
//             pool: true, // Use pooled connections
//             maxConnections: 10, // Maximum number of connections to keep in pool
//             maxMessages: Infinity, // No limit to number of messages per connection
//             host: 'smtp.gmail.com',
//             port: 587,
//             secure: false,
//             requireTLS: true,
//             auth: {
//                 user: EMAIL_USER,
//                 pass: EMAIL_PASS
//             },
//             // Set reasonable timeouts
//             tls: {
//                 rejectUnauthorized: true,
//                 minVersion: 'TLSv1.2',
//                 timeout: 10000
//             },
//             connectionTimeout: 10000,
//             greetingTimeout: 10000,
//             socketTimeout: 10000
//         });

//         // Email template
//         const mailOptions = {
//             from: `"Your App" <${EMAIL_USER}>`,
//             to: email,
//             subject: 'Your OTP for Verification',
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Verification Code</h2>
//                     <p>Dear User,</p>
//                     <p>Your OTP for verification is:</p>
//                     <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
//                         <h1 style="color: #F15A29; margin: 0; letter-spacing: 5px;">${otp}</h1>
//                     </div>
//                     <p>This code will expire in 10 minutes.</p>
//                     <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
//                     <p>Best regards,<br/>Your App Team</p>
//                 </div>
//             `
//         };

//         // Send email asynchronously and respond to client immediately
//         transporter.sendMail(mailOptions).catch(error => {
//             console.error('Email sending error:', error);
//             // Handle email sending error (perhaps store in a retry queue)
//         });

//         // Respond to client immediately after OTP is stored
//         res.status(200).json({
//             success: true,
//             message: 'OTP sent successfully'
//         });

//     } catch (error) {
//         console.error('Detailed error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to send OTP email',
//             error: error.message
//         });
//     }
// };

// // controllers/emailController.js


// exports.verifyOTP = async (req, res) => {
//     try {
//         const { email, otp } = req.body;
//         const user = await User.findOne({
//             where:{
//                 email:email
//             },
//             attributes: { exclude: ['password'] }
//         })
//         // Rest of your verification logic...
//         if (!email || !otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Email and OTP are required'
//             });
//         }

//         const storedData = otpStore.get(email);
//         console.log(storedData);
        
//         if (!storedData) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No OTP found for this email. Please request a new one.'
//             });
//         }

//         if(storedData.otp !== otp && storedData.email !== email) {
//             return res.json({
//                 success: false,
//                 message: 'Invalid OTP'
//             });
//         }else{
//             return res.status(200).json({
//                 success: true,
//                 message: 'OTP verified successfully',
//                 role : user.role,
//                 uid:user.uid,
//                 data:user
//             })
//         }
//     } catch (error) {
//         console.error('Verification error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Internal server error during verification'
//         });
//     }
// };
const axios = require("axios");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();
const User = require("../model/UserModel");

const DROP4SMS_API_KEY = 'c8ab61fc8ca8d205b068a45c7030a5b1'; // Use environment variable
const SENDER_ID = "FEERIM"; 
const ROUTE = "2";
const TEMPLATE_ID = "1707173935554863553"; 

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const otpStore = new Map(); // { identifier: { otp, timestamp } }

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const isOTPExpired = (timestamp) => Date.now() - timestamp > 10 * 60 * 1000; // 10 minutes

exports.sendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate a single OTP for both email and phone
        const otp = generateOTP();

        // Store OTP for both email and phone
        otpStore.set(email, { otp, timestamp: Date.now() });
        otpStore.set(phone, { otp, timestamp: Date.now() });

        // SMS Message
        const smsMessage = `Dear Customer, Your OTP for login is ${otp}. Do not share this OTP with anyone. FETECH.`;
        const smsApiUrl = `http://login.draft4sms.com/api/smsapi?key=${DROP4SMS_API_KEY}&route=${ROUTE}&sender=${SENDER_ID}&number=${phone}&sms=${encodeURIComponent(smsMessage)}&templateid=${TEMPLATE_ID}`;

        // Email Message
        const mailOptions = {
            from: `"Your App" <${EMAIL_USER}>`,
            to: email,
            subject: "Your OTP for Verification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verification Code</h2>
                    <p>Dear User,</p>
                    <p>Your OTP for verification is:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
                        <h1 style="color: #F15A29; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                    <p>Best regards,<br/>Your App Team</p>
                </div>
            `,
        };

        // Create transporter for email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        // Send SMS and Email concurrently
        const [smsResponse, emailResponse] = await Promise.all([
            axios.get(smsApiUrl).then(response => {
                console.log("SMS sent successfully:", response.data);
                return response.data;
            }).catch(error => {
                console.error("Error sending SMS:", error.response?.data || error.message);
                throw new Error("Failed to send SMS");
            }),

            transporter.sendMail(mailOptions).then(info => {
                console.log("Email sent successfully:", info.response);
                return info.response;
            }).catch(error => {
                console.error("Error sending Email:", error.message);
                throw new Error("Failed to send Email");
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "OTP sent via SMS and Email",
            smsResponse,
            emailResponse
        });

    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};


exports.verifyOTP = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;

        // Check stored OTPs
        const storedEmailOTP = otpStore.get(email);
        const storedPhoneOTP = otpStore.get(phone);

        if (!storedEmailOTP || !storedPhoneOTP) {
            return res.status(404).json({ success: false, message: "No OTP found. Request a new one." });
        }

        // Check expiry
        if (isOTPExpired(storedEmailOTP.timestamp) || isOTPExpired(storedPhoneOTP.timestamp)) {
            otpStore.delete(email);
            otpStore.delete(phone);
            return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
        }

        // Verify OTP
        if (storedEmailOTP.otp !== otp || storedPhoneOTP.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Delete OTP after successful verification
        otpStore.delete(email);
        otpStore.delete(phone);

        // Fetch user details
        const user = await User.findOne({ where: { email }, attributes: { exclude: ["password"] } });

        return res.status(200).json({ success: true, message: "OTP verified successfully", data: user });

    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during verification" });
    }
};
