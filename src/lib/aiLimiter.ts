export class AILimiter {
  private timestamps: number[] = [];
  private limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }
  
  canRequest(): boolean {
    const now = Date.now();
    // Keep only timestamps from the last 60 seconds
    this.timestamps = this.timestamps.filter(t => now - t < 60000);
    
    if (this.timestamps.length >= this.limit) {
      return false; // Rate limit reached locally, block request.
    }
    
    this.timestamps.push(now);
    return true;
  }
}

// Export singleton instances to be shared across the Node process in dev
export const chatLimiter = new AILimiter(5); // Strict 5 RPM for Flash moderation
export const eventsLimiter = new AILimiter(5); // 30 RPM for Gemma recommendations
