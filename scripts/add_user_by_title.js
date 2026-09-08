const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '6af940bb-529d-41e9-90a1-604ea5899af9';
  const eventTitle = "Student 98's Study Meetup";

  try {
    const event = await prisma.event.findFirst({
      where: {
        title: eventTitle
      }
    });

    if (!event) {
      console.log('Could not find an event with that title.');
      return;
    }

    const result = await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: userId
        }
      },
      update: {},
      create: {
        eventId: event.id,
        userId: userId
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
