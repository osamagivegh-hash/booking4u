const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
require('dotenv').config();

async function testMessaging() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking4u');
    console.log('✅ Connected to MongoDB');

    // Find or create test users
    let user1 = await User.findOne({ email: 'testuser1@example.com' });
    let user2 = await User.findOne({ email: 'testuser2@example.com' });

    if (!user1) {
      user1 = await User.create({
        name: 'مستخدم تجريبي 1',
        email: 'testuser1@example.com',
        password: 'password123',
        role: 'customer',
        isActive: true
      });
      console.log('✅ Created test user 1');
    }

    if (!user2) {
      user2 = await User.create({
        name: 'مستخدم تجريبي 2',
        email: 'testuser2@example.com',
        password: 'password123',
        role: 'business',
        isActive: true
      });
      console.log('✅ Created test user 2');
    }

    // Clear existing test messages
    await Message.deleteMany({
      $or: [
        { senderId: user1._id },
        { receiverId: user1._id },
        { senderId: user2._id },
        { receiverId: user2._id }
      ]
    });
    console.log('✅ Cleared existing test messages');

    // Create sample messages
    const sampleMessages = [
      {
        senderId: user1._id,
        receiverId: user2._id,
        subject: 'استفسار عن الخدمة',
        content: 'مرحباً، أود الاستفسار عن خدمة قص الشعر المتوفرة لديكم. ما هي الأسعار والأوقات المتاحة؟',
        messageType: 'inquiry',
        priority: 'normal',
        tags: ['استفسار', 'خدمة']
      },
      {
        senderId: user2._id,
        receiverId: user1._id,
        subject: 'رد على استفسارك',
        content: 'شكراً لاستفسارك. خدمة قص الشعر متوفرة من السبت إلى الخميس من 9 صباحاً إلى 9 مساءً. السعر يبدأ من 50 ريال.',
        messageType: 'general',
        priority: 'normal',
        tags: ['رد', 'معلومات']
      },
      {
        senderId: user1._id,
        receiverId: user2._id,
        subject: 'حجز موعد',
        content: 'أود حجز موعد يوم الأحد القادم في الساعة 2 ظهراً لخدمة قص الشعر.',
        messageType: 'booking_related',
        priority: 'high',
        tags: ['حجز', 'موعد']
      },
      {
        senderId: user2._id,
        receiverId: user1._id,
        subject: 'تأكيد الحجز',
        content: 'تم تأكيد حجزك بنجاح. سيكون موعدك يوم الأحد في الساعة 2 ظهراً. يرجى الحضور قبل الموعد بـ 10 دقائق.',
        messageType: 'booking_related',
        priority: 'normal',
        tags: ['تأكيد', 'حجز']
      }
    ];

    const createdMessages = await Message.insertMany(sampleMessages);
    console.log(`✅ Created ${createdMessages.length} test messages`);

    // Create a conversation thread
    const threadId = createdMessages[0]._id;
    await Message.updateMany(
      { _id: { $in: createdMessages.map(m => m._id) } },
      { threadId: threadId }
    );
    console.log('✅ Created conversation thread');

    console.log('🎉 Messaging test completed successfully!');
    console.log(`📧 Created conversation between ${user1.name} and ${user2.name}`);
    console.log(`📧 Messages: ${createdMessages.length}`);
    console.log(`📧 Thread ID: ${threadId}`);

  } catch (error) {
    console.error('❌ Error testing messaging:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testMessaging();


