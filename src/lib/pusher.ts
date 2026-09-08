import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  host: process.env.NEXT_PUBLIC_PUSHER_HOST || undefined,
  port: process.env.NEXT_PUBLIC_PUSHER_PORT || undefined,
  useTLS: process.env.NEXT_PUBLIC_PUSHER_HOST ? false : true,
});
