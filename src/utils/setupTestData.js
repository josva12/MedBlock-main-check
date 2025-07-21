require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification'); // Import Notification model
const { connect } = require('../config/database');

const users = [
  {
    fullName: 'Joshua Mumbua',
    email: 'joshuamumbua12@gmail.com',
    password: 'Password123@',
    role: 'admin',
    title: 'Mr.',
    phone: '+254712345678',
    address: { street: '123 Admin St', city: 'Nairobi', county: 'Nairobi', subCounty: 'CBD' }
  },
  {
    fullName: 'Bermudes Abigail',
    email: 'bermudesabigail414@gmail.com',
    password: 'Password123@',
    role: 'front-desk',
    title: 'Ms.',
    phone: '+254712345679',
    address: { street: '456 Desk St', city: 'Nairobi', county: 'Nairobi', subCounty: 'Westlands' }
  },
  {
    fullName: 'Dr. Unique Test',
    email: 'doctor.unique.test.20250709@example.com',
    password: 'Password123@',
    role: 'doctor',
    title: 'Dr.',
    phone: '+254712345680',
    address: { street: '789 Doctor Ave', city: 'Nairobi', county: 'Nairobi', subCounty: 'Kilimani' },
    isGovernmentVerified: true,
    professionalVerification: { status: 'verified' }
  },
  {
    fullName: 'Patient One',
    email: 'patient1@example.com',
    password: 'Password123@',
    role: 'patient',
    title: 'Mr.',
    phone: '+254712345681', // Changed from phoneNumber to phone to match User schema
    address: { street: '1 Patient Rd', city: 'Mombasa', county: 'Mombasa', subCounty: 'Nyali', ward: 'Nyali' },
    // Patient-specific data that will go into the Patient model
    patientData: {
      firstName: 'Patient',
      lastName: 'One',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      nationalId: '12345678',
      emergencyContact: { name: 'Jane Doe', relationship: 'spouse', phoneNumber: '+254712345684' }
    }
  },
  {
    fullName: 'Patient Two',
    email: 'patient2@example.com',
    password: 'Password123@',
    role: 'patient',
    title: 'Ms.',
    phone: '+254712345682', // Changed from phoneNumber to phone
    address: { street: '2 Patient Ln', city: 'Kisumu', county: 'Kisumu', subCounty: 'Milimani', ward: 'Market Milimani' },
    patientData: {
      firstName: 'Patient',
      lastName: 'Two',
      dateOfBirth: new Date('1992-05-10'),
      gender: 'female',
      nationalId: '87654321',
      emergencyContact: { name: 'John Doe', relationship: 'sibling', phoneNumber: '+254712345685' }
    }
  },
  {
    fullName: 'Patient Three',
    email: 'patient3@example.com',
    password: 'Password123@',
    role: 'patient',
    title: 'Mr.',
    phone: '+254712345683', // Changed from phoneNumber to phone
    address: { street: '3 Patient Ct', city: 'Nakuru', county: 'Nakuru', subCounty: 'CBD', ward: 'Biashara' },
    patientData: {
      firstName: 'Patient',
      lastName: 'Three',
      dateOfBirth: new Date('1988-11-20'),
      gender: 'male',
      nationalId: '11223344',
      emergencyContact: { name: 'Mary Jane', relationship: 'friend', phoneNumber: '+254712345686' }
    }
  }
];

const resources = [
  {
    title: 'Understanding Your Blood Pressure',
    content: 'A comprehensive guide to understanding and managing your blood pressure.',
    category: 'health'
  }
];

const setup = async () => {
  try {
    const db = await connect(); // Connect and get instance
    console.log('Database connected...');

    // Drop collections for a clean slate
    await mongoose.connection.collection('users').drop(() => {});
    await mongoose.connection.collection('patients').drop(() => {});
    await mongoose.connection.collection('resources').drop(() => {});
    console.log('Cleared existing users, patients, and resources...');

    // Create users - and define admin user early for use in createdBy fields
    const adminUserDefinition = users.find(u => u.role === 'admin');
    if (!adminUserDefinition) throw new Error('Admin user not found in test data');

    for (const userData of users) {
      // Always create a User document first
      const { patientData, ...userModelData } = userData;
      const user = new User(userModelData);
      await user.save();

      // If the user is a patient, create a corresponding Patient document
      if (user.role === 'patient' && patientData) {
        // We need the admin's _id to set the createdBy field
        const admin = await User.findOne({ email: adminUserDefinition.email });
        if (!admin) throw new Error('Admin user could not be found in the database for patient creation');
        
        const patient = new Patient({
          ...patientData,
          userAccount: user._id, // Link to the new User account
          createdBy: admin._id,
          address: userData.address 
        });
        await patient.save();
      }
    }
    console.log('Users and Patients created successfully...');
    
    // Fetch the created admin user to use its _id for notifications and resources
    const admin = await User.findOne({ email: adminUserDefinition.email });
    if (!admin) throw new Error('Could not find admin user after creation.');

    // Create a notification for Patient One
    const patientUser = await User.findOne({ email: 'patient1@example.com' });
    if (patientUser) {
      const notification = new Notification({
        userId: patientUser._id, // Corrected from 'recipient' to 'userId'
        sentBy: admin._id, // Corrected from 'sender'
        type: 'info', // Corrected from 'system' to a valid enum value 'info'
        title: 'Welcome to MedBlock', // Added required title field
        message: 'Your account is ready and you can start exploring our services.'
      });
      await notification.save();
      console.log('Sample notification created for Patient One...');
    }

    // Create resources
    if (admin) {
      for (const resourceData of resources) {
        const resource = new Resource({ ...resourceData, author: admin._id });
        await resource.save();
      }
      console.log('Resources created successfully...');
    }
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

setup(); 