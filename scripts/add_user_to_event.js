const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '055d104c-2107-48b0-8dc2-901457a563be';
  const eventId = '1d28fa99-f0d6-456b-a081-0a5302eb70e1';

  try {
    const result = await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      },
      update: {},
      create: {
        eventId,
        userId
      }
    });
    console.log('Successfully added user to event:', result);
  } catch (error) {
    console.error('Failed to add user to event:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
