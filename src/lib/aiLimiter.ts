class AILimiter {
  private timestamps: number[] = [];
  
  private get limit(): number {
    const keysCount = (process.env.GEMINI_API_KEY || "").split(',').filter(Boolean).length;
    return Math.max(1, 9 * (keysCount || 1)); // 1 RPM per model per key
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

// Export a singleton instance to be shared across the Node process in dev
export const aiLimiter = new AILimiter();
