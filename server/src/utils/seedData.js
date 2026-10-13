require('../config/dnsResolver');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelancer_tracker';
    console.log(`Connecting to MongoDB for seeding at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Payment.deleteMany({});

    console.log('Creating demo user...');
    const demoUser = await User.create({
      name: 'Alex Morgan',
      email: 'demo@freelancertracker.com',
      password: 'Password123!',
      title: 'Senior Full Stack Developer & UI Designer',
      currency: 'USD'
    });

    console.log('Creating clients...');
    const client1 = await Client.create({
      user: demoUser._id,
      name: 'Acme Corporation',
      email: 'contact@acmecorp.com',
      phone: '+1 (555) 234-5678',
      company: 'Acme Global Inc',
      address: '100 Enterprise Way, Suite 400, San Francisco, CA',
      notes: 'Long-term enterprise client. Pays net-15.',
      status: 'Active'
    });

    const client2 = await Client.create({
      user: demoUser._id,
      name: 'Sophia Reynolds',
      email: 'sophia@lumendigital.io',
      phone: '+1 (555) 876-5432',
      company: 'Lumen Digital Studios',
      address: '742 Evergreen Terrace, Austin, TX',
      notes: 'Marketing agency client with recurring design and frontend retainers.',
      status: 'Active'
    });

    const client3 = await Client.create({
      user: demoUser._id,
      name: 'Apex Healthtech',
      email: 'billing@apexhealth.co',
      phone: '+1 (555) 345-9876',
      company: 'Apex Health Systems',
      address: '250 Medical Center Blvd, Boston, MA',
      notes: 'HIPAA compliant portal project.',
      status: 'Active'
    });

    const client4 = await Client.create({
      user: demoUser._id,
      name: 'Marcus Vance',
      email: 'marcus@vanceventures.com',
      phone: '+1 (555) 901-2345',
      company: 'Vance Ventures LLC',
      address: '12 Wall Street, New York, NY',
      notes: 'Fintech startup dashboard.',
      status: 'Inactive'
    });

    console.log('Creating projects...');
    // Project 1: Acme - In Progress
    const project1 = await Project.create({
      user: demoUser._id,
      client: client1._id,
      name: 'Enterprise E-Commerce Replatforming',
      description: 'Migrating legacy Shopify store to custom Next.js & Node.js headless architecture.',
      fee: 8500,
      paidAmount: 5000,
      status: 'In Progress',
      priority: 'High',
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-15')
    });

    // Project 2: Lumen - In Progress
    const project2 = await Project.create({
      user: demoUser._id,
      client: client2._id,
      name: 'Brand Identity & Marketing Website',
      description: 'Interactive portfolio and Webflow animation design system.',
      fee: 4200,
      paidAmount: 2100,
      status: 'In Progress',
      priority: 'Medium',
      startDate: new Date('2026-08-15'),
      dueDate: new Date('2026-10-30')
    });

    // Project 3: Apex Healthtech - Completed
    const project3 = await Project.create({
      user: demoUser._id,
      client: client3._id,
      name: 'Patient Telehealth Appointment Portal',
      description: 'React patient portal with WebRTC video calling and secure prescription review.',
      fee: 9600,
      paidAmount: 9600,
      status: 'Completed',
      priority: 'High',
      startDate: new Date('2026-05-10'),
      dueDate: new Date('2026-07-25')
    });

    // Project 4: Vance Ventures - Completed
    const project4 = await Project.create({
      user: demoUser._id,
      client: client4._id,
      name: 'Crypto & Equity Portfolio Analytics API',
      description: 'Express microservice calculating real-time risk ratios and portfolio Sharpe ratio.',
      fee: 6000,
      paidAmount: 6000,
      status: 'Completed',
      priority: 'Medium',
      startDate: new Date('2026-06-01'),
      dueDate: new Date('2026-07-15')
    });

    // Project 5: Acme - Pending
    const project5 = await Project.create({
      user: demoUser._id,
      client: client1._id,
      name: 'Warehouse Barcode Scanner Mobile App',
      description: 'React Native warehouse inventory barcode scanning application.',
      fee: 5500,
      paidAmount: 0,
      status: 'Pending',
      priority: 'Low',
      startDate: new Date('2026-11-01'),
      dueDate: new Date('2026-12-20')
    });

    console.log('Creating payments...');
    const now = new Date();

    await Payment.create({
      user: demoUser._id,
      project: project3._id,
      client: client3._id,
      amount: 4800,
      paymentDate: new Date(now.getFullYear(), now.getMonth() - 4, 15),
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      invoiceNumber: 'INV-2026-001',
      notes: 'Initial milestone payment (50% upfront)'
    });

    await Payment.create({
      user: demoUser._id,
      project: project3._id,
      client: client3._id,
      amount: 4800,
      paymentDate: new Date(now.getFullYear(), now.getMonth() - 3, 20),
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      invoiceNumber: 'INV-2026-002',
      notes: 'Final project completion milestone'
    });

    await Payment.create({
      user: demoUser._id,
      project: project4._id,
      client: client4._id,
      amount: 6000,
      paymentDate: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      paymentMethod: 'Stripe',
      status: 'Completed',
      invoiceNumber: 'INV-2026-003',
      notes: 'Full payment upon delivery of API specs'
    });

    await Payment.create({
      user: demoUser._id,
      project: project1._id,
      client: client1._id,
      amount: 3000,
      paymentDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      invoiceNumber: 'INV-2026-004',
      notes: 'Sprint 1 & 2 deliverable invoice'
    });

    await Payment.create({
      user: demoUser._id,
      project: project1._id,
      client: client1._id,
      amount: 2000,
      paymentDate: new Date(now.getFullYear(), now.getMonth(), 2),
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      invoiceNumber: 'INV-2026-005',
      notes: 'Sprint 3 architecture milestone'
    });

    await Payment.create({
      user: demoUser._id,
      project: project2._id,
      client: client2._id,
      amount: 2100,
      paymentDate: new Date(now.getFullYear(), now.getMonth(), 6),
      paymentMethod: 'Credit Card',
      status: 'Completed',
      invoiceNumber: 'INV-2026-006',
      notes: 'Design approval deposit'
    });

    await Payment.create({
      user: demoUser._id,
      project: project1._id,
      client: client1._id,
      amount: 3500,
      paymentDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      paymentMethod: 'Bank Transfer',
      status: 'Pending',
      invoiceNumber: 'INV-2026-007',
      notes: 'Final acceptance testing payment'
    });

    console.log('\n Sample database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Email:    demo@freelancertracker.com');
    console.log('Password: Password123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
