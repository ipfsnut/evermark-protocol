import { CommandResult } from './commandProcessor';

export class BotResponseSender {
  private neynarApiKey: string;
  private botSignerUuid: string;

  constructor() {
    this.neynarApiKey = process.env.NEYNAR_API_KEY || '';
    this.botSignerUuid = process.env.BOT_SIGNER_UUID || '';
    
    if (!this.neynarApiKey || !this.botSignerUuid) {
      throw new Error('Missing required bot configuration: NEYNAR_API_KEY and BOT_SIGNER_UUID');
    }
  }

  async sendCommandResponse(userFid: number, parentHash: string, result: CommandResult): Promise<void> {
    if (result.shouldThread && result.message.length > 280) {
      // Send as thread for long messages
      await this.sendThread(userFid, parentHash, result.message);
    } else {
      // Send as single reply
      await this.sendReply(parentHash, result.message);
    }
  }

  async sendHelpMessage(userFid: number, parentHash: string): Promise<void> {
    const helpMessage = `👋 Hi! I'm the Evermark bot.\n\n` +
                       `Try saying:\n` +
                       `• "evermark this cast" (when replying to content)\n` +
                       `• "save https://example.com"\n` +
                       `• "search for my articles"\n` +
                       `• "help" for more commands\n\n` +
                       `💡 I help you save content to your permanent digital memory!`;
    
    await this.sendReply(parentHash, helpMessage);
  }

  async sendErrorResponse(userFid: number, parentHash: string, errorMessage: string): Promise<void> {
    const message = `❌ ${errorMessage}\n\nTry "help" to see what I can do!`;
    await this.sendReply(parentHash, message);
  }

  async sendWelcomeMessage(userFid: number): Promise<void> {
    const welcomeMessage = `🎉 Welcome to Evermark!\n\n` +
                          `I help you save and search your digital content.\n\n` +
                          `Try mentioning me and saying:\n` +
                          `• "evermark this cast" when replying to something interesting\n` +
                          `• "save [any URL]" to add it to your archive\n` +
                          `• "search for [topic]" to find your saved content\n\n` +
                          `Let's build your digital memory together! 🧠✨`;
    
    await this.sendCast(welcomeMessage);
  }

  private async sendReply(parentHash: string, text: string): Promise<void> {
    try {
      const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.neynarApiKey}`,
        },
        body: JSON.stringify({
          signer_uuid: this.botSignerUuid,
          text: text,
          parent: parentHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to send reply:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Reply sent successfully:', result.cast.hash);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }

  private async sendCast(text: string): Promise<void> {
    try {
      const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.neynarApiKey}`,
        },
        body: JSON.stringify({
          signer_uuid: this.botSignerUuid,
          text: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to send cast:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Cast sent successfully:', result.cast.hash);
      
    } catch (error) {
      console.error('Error sending cast:', error);
      throw error;
    }
  }

  private async sendThread(userFid: number, parentHash: string, longMessage: string): Promise<void> {
    // Split long message into chunks of ~280 characters
    const chunks = this.splitMessageIntoChunks(longMessage, 280);
    
    let currentParent = parentHash;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLast = i === chunks.length - 1;
      
      // Add thread indicators
      const threadText = chunks.length > 1 
        ? `${chunk} ${isLast ? '' : `(${i + 1}/${chunks.length})`}`
        : chunk;
      
      try {
        const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.neynarApiKey}`,
          },
          body: JSON.stringify({
            signer_uuid: this.botSignerUuid,
            text: threadText,
            parent: currentParent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Failed to send thread part ${i + 1}:`, errorData);
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const result = await response.json();
        console.log(`Thread part ${i + 1} sent:`, result.cast.hash);
        
        // Use this cast as parent for the next one
        currentParent = result.cast.hash;
        
        // Brief delay between thread posts
        if (!isLast) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error sending thread part ${i + 1}:`, error);
        break; // Stop the thread if one part fails
      }
    }
  }

  private splitMessageIntoChunks(message: string, maxLength: number): string[] {
    if (message.length <= maxLength) {
      return [message];
    }

    const chunks: string[] = [];
    const lines = message.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? '\n' : '') + line;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = line;
        } else {
          // Line is too long, split it
          const words = line.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if (wordChunk.length + word.length + 1 <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) {
                chunks.push(wordChunk);
                wordChunk = word;
              } else {
                // Single word is too long, just truncate it
                chunks.push(word.slice(0, maxLength - 3) + '...');
              }
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }
}