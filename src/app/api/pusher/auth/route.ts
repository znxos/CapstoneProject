import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { pusherServer } from '@/lib/pusher';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let bodyText = "";
  try {
    bodyText = await req.text();
  } catch (e) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const params = new URLSearchParams(bodyText);
  const socket_id = params.get('socket_id');
  const channel_name = params.get('channel_name');

  if (!socket_id || !channel_name) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const eventId = channel_name.replace('private-encrypted-', '');

  const user = await prisma.user.findUnique({
    where: { studentEmail: session.user.email }
  });

  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }

  // Verify Active Membership
  const [isParticipant, isHost] = await Promise.all([
    prisma.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId: user.id } }
    }),
    prisma.event.findFirst({
      where: { id: eventId, hostId: user.id }
    })
  ]);

  if (!isParticipant && !isHost) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
