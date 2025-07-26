const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

const sampleResources = [
  {
    title: 'Understanding Mental Health: A Comprehensive Guide',
    content: 'Mental health is a state of well-being in which an individual realizes his or her own abilities, can cope with the normal stresses of life, can work productively and fruitfully, and is able to make a contribution to his or her community. It\'s more than just the absence of mental illness. This guide covers common mental health conditions, coping strategies, and when to seek professional help. Remember, taking care of your mental health is just as important as your physical health. Seek support from friends, family, or professionals if you are struggling. There are many resources available to help you on your journey to well-being. This guide is for informational purposes only and does not constitute medical advice.',
    category: 'health',
    reactions: {
      happy: 12,
      sad: 3,
      helpful: 25,
      unhelpful: 1,
      neutral: 5
    }
  },
  {
    title: 'The Benefits of a Balanced Diet',
    content: 'A balanced diet provides your body with the essential nutrients it needs to function correctly. It helps maintain a healthy weight, reduces the risk of chronic diseases, and promotes overall well-being. Incorporating a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats is crucial. Avoid excessive intake of processed foods, sugary drinks, and unhealthy fats. Small changes can make a big difference in your dietary habits. Consult a nutritionist for personalized advice. This blog aims to provide general information and should not replace professional medical advice.',
    category: 'health',
    reactions: {
      happy: 8,
      sad: 1,
      helpful: 15,
      unhelpful: 0,
      neutral: 2
    }
  },
  {
    title: 'Financial Planning for Healthcare Costs',
    content: 'Healthcare costs can be a significant burden. Effective financial planning is crucial to manage these expenses. This includes understanding your insurance policy, setting up a health savings account (HSA) or flexible spending account (FSA), and budgeting for unexpected medical bills. Planning ahead can alleviate stress and ensure you have access to the care you need without financial strain. Consider consulting a financial advisor specializing in healthcare planning. This article is for informational purposes and not financial advice.',
    category: 'finance',
    reactions: {
      happy: 5,
      sad: 2,
      helpful: 10,
      unhelpful: 3,
      neutral: 0
    }
  },
  {
    title: 'The Importance of Regular Exercise',
    content: 'Regular physical activity is vital for maintaining good health. It strengthens your heart, improves circulation, boosts your immune system, and enhances your mood. Aim for at least 30 minutes of moderate-intensity exercise most days of the week. This can include brisk walking, jogging, cycling, or swimming. Find an activity you enjoy to make it sustainable. Always consult your doctor before starting any new exercise program. This content is for general knowledge and not a substitute for professional medical advice.',
    category: 'health',
    reactions: {
      happy: 15,
      sad: 0,
      helpful: 30,
      unhelpful: 0,
      neutral: 1
    }
  },
  {
    title: 'Understanding Health Insurance Basics',
    content: 'Health insurance can be complex, but understanding the basics is essential for making informed decisions. Learn about different types of plans, deductibles, copayments, and out-of-pocket maximums. Understanding your coverage can help you avoid unexpected bills and ensure you get the care you need. Review your policy annually and ask questions about anything you don\'t understand. This guide provides general information about health insurance concepts.',
    category: 'finance',
    reactions: {
      happy: 6,
      sad: 1,
      helpful: 18,
      unhelpful: 2,
      neutral: 3
    }
  },
  {
    title: 'Preventive Care: Your First Line of Defense',
    content: 'Preventive care is crucial for maintaining good health and catching potential issues early. Regular check-ups, screenings, and vaccinations can prevent serious health problems. Don\'t wait until you\'re sick to see a doctor. Schedule regular appointments and stay up to date with recommended screenings for your age and risk factors. Prevention is always better than treatment. This information is for educational purposes only.',
    category: 'health',
    reactions: {
      happy: 20,
      sad: 0,
      helpful: 35,
      unhelpful: 0,
      neutral: 2
    }
  }
];

async function seedResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('✅ Cleared existing resources');

    // Insert sample resources
    const insertedResources = await Resource.insertMany(sampleResources);
    console.log(`✅ Inserted ${insertedResources.length} sample resources`);

    // Display the created resources
    console.log('\n📋 Created Resources:');
    insertedResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} (${resource.category})`);
    });

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seeding function
seedResources(); 