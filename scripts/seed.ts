import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const universities = ['CPUT', 'UWC', 'UCT', 'Stellenbosch University'];
const interestsList = ['Tech', 'Social', 'Outdoors', 'Creative', 'Study', 'Gaming', 'Sports', 'Music', 'Art', 'Fitness'];
const categories = ['Tech', 'Study', 'Outdoors', 'Social', 'Creative'];
const locations = ['Main Library', 'Student Center', 'Sports Field', 'Engineering Building', 'Cafeteria', 'Auditorium', 'Quad', 'Online'];

// Helper to generate a random vector of length 768 (standard Gemini size)
function generateRandomNormalizedVector(length = 768) {
  const vec = Array.from({ length }, () => Math.random() * 2 - 1);
  const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map(val => val / mag);
}

function getRandomElements(arr: string[], min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log("Starting seeding of 100 users and 100 events...");

  // Clean the database if needed, or just upsert. 
  // We will upsert to avoid blowing away everything, but for 100 users it's easier to create uniquely.
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const createdUsers = [];

  // Generate 100 Users
  for (let i = 1; i <= 100; i++) {
    const age = Math.floor(Math.random() * (25 - 18 + 1)) + 18; // 18 to 25
    const yearOfStudy = age === 18 || age === 19 ? 1 : Math.floor(Math.random() * 3) + 2; // 19s are 1st year, older are 2-4
    const uni = universities[Math.floor(Math.random() * universities.length)];
    const energy = Math.random() > 0.5 ? 'High' : 'Low';
    
    const user = await prisma.user.upsert({
      where: { studentEmail: `student${i}@${uni.toLowerCase().replace(' ', '')}.edu` },
      update: {},
      create: {
        studentEmail: `student${i}@${uni.toLowerCase().replace(' ', '')}.edu`,
        displayName: `Student ${i}`,
        passwordHash,
        isVerified: true,
        isFirstLogin: false,
        age,
        yearOfStudy,
        university: uni,
        isFirstTimeUni: yearOfStudy === 1,
        bio: `Hi, I am student ${i} from ${uni}. I love ${getRandomElements(interestsList, 1, 2).join(' and ')}.`,
        interests: getRandomElements(interestsList, 2, 4),
        lookingForTags: getRandomElements(interestsList, 1, 3),
        extractedAiTags: getRandomElements(interestsList, 1, 2),
        socialEnergyLevel: energy,
        cachedVectorEmbedding: generateRandomNormalizedVector()
      }
    });
    
    createdUsers.push(user);
    if (i % 10 === 0) console.log(`Created ${i} users...`);
  }

  console.log("Finished creating users. Now creating events...");

  // Generate 100 Events (1 per user)
  let eventCount = 0;
  for (const user of createdUsers) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const daysFromNow = Math.floor(Math.random() * 14); // 0 to 13 days from now
    const startHour = Math.floor(Math.random() * (20 - 8 + 1)) + 8; // 8 AM to 8 PM
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + daysFromNow);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startHour + Math.floor(Math.random() * 3) + 1); // 1 to 3 hours long

    const event = await prisma.event.create({
      data: {
        title: `${user.displayName}'s ${category} Meetup`,
        category,
        description: `Join me for a great time at ${location}! This is a ${category.toLowerCase()} event hosted by someone from ${user.university}.`,
        startTime,
        endTime,
        location,
        maxParticipants: Math.floor(Math.random() * 45) + 5, // 5 to 50
        hostId: user.id,
        status: 'ACTIVE',
        cachedVectorEmbedding: generateRandomNormalizedVector()
      }
    });
    
    // Add host as participant
    await prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        userId: user.id
      }
    });
    
    eventCount++;
    if (eventCount % 10 === 0) console.log(`Created ${eventCount} events...`);
  }

  console.log("Seeding completely finished!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
