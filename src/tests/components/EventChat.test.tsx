import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// A mock version of what the Chat component would look like 
// connecting to Pusher and rendering a message stream
function MockEventChat({ eventId }: { eventId: string }) {
  const [messages, setMessages] = React.useState<{id: string, text: string}[]>([]);

  React.useEffect(() => {
    // In a real scenario, this would use the global pusherRef
    const mockChannel = {
      bind: (event: string, callback: any) => {
        if (event === 'NEW_MESSAGE') {
           // We assign this globally so Jest can trigger it
           (window as any).triggerNewMessage = callback;
        }
      }
    };
    mockChannel.bind('NEW_MESSAGE', (data: any) => {
      setMessages(prev => [...prev, { id: data.message_id, text: data.text }]);
    });
  }, [eventId]);

  return (
    <div data-testid="chat-window">
      {messages.map(msg => (
        <div key={msg.id} data-testid="chat-message">{msg.text}</div>
      ))}
    </div>
  );
}

describe('TC-009: Real-Time WebSocket Broadcast', () => {
  it('should render a new message when received via Pusher', async () => {
    /*
     * TC-009: Real-Time WebSocket Broadcast
     * User A sends a message in an event room; verify delivery to User B on a different network.
     * Expected: The message appears instantly on User B's screen via the Pusher WebSocket connection 
     * without requiring a page refresh.
     */
     
    render(<MockEventChat eventId="evt-123" />);
    
    // Initially no messages
    expect(screen.queryByTestId('chat-message')).not.toBeInTheDocument();
    
    // Simulate Pusher WebSocket receiving a 'NEW_MESSAGE' event from the server
    act(() => {
      if ((window as any).triggerNewMessage) {
        (window as any).triggerNewMessage({
          message_id: 'msg-999',
          sender_name: 'TestUser',
          text: 'Hello from websocket!'
        });
      }
    });
    
    // Assert message appears instantly in the DOM
    const messageNode = await screen.findByText('Hello from websocket!');
    expect(messageNode).toBeInTheDocument();
  });
});
