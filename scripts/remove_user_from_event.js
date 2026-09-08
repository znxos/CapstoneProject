const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '055d104c-2107-48b0-8dc2-901457a563be';
  const eventId = '1d28fa99-f0d6-456b-a081-0a5302eb70e1';

  try {
    const result = await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });
    console.log('Successfully removed user from event:', result);
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('User was not in the event, nothing to remove.');
    } else {
      console.error('Failed to remove user from event:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
