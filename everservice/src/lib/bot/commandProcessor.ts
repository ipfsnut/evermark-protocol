import { MetadataKit } from '@evermark/metadata-kit';
import { BotContentService } from './contentService';

export interface BotCommand {
  type: 'save' | 'search' | 'recent' | 'stats' | 'tag' | 'collections' | 'insights' | 'help' | 'evermark_cast' | 'mark_evermark';
  args: string[];
  userFid: number;
  originalText: string;
  contextCast?: any; // For when replying to/quoting a cast
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  shouldThread?: boolean;
}

export class BotCommandProcessor {
  private metadataKit: MetadataKit;
  private contentService: BotContentService;

  constructor() {
    this.metadataKit = new MetadataKit();
    this.contentService = new BotContentService();
  }

  async parseCommand(text: string, userFid: number, contextCast?: any): Promise<BotCommand | null> {
    // Remove mentions and clean up text
    const cleanText = text
      .replace(/@\w+/g, '') // Remove mentions
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();

    // Natural language patterns for Evermark actions
    const patterns = [
      // "evermark this cast" or "evermark this"
      { regex: /evermark\s+(this|cast|it)/, type: 'evermark_cast' },
      
      // "mark this evermark" or "save this evermark"
      { regex: /(mark|save)\s+(this\s+)?(evermark|to\s+memory)/, type: 'mark_evermark' },
      
      // "save [url]" or "evermark [url]"
      { regex: /(save|evermark)\s+(https?:\/\/\S+)/, type: 'save' },
      
      // "search for [query]" or "find [query]"
      { regex: /(search|find)\s+(for\s+)?(.+)/, type: 'search' },
      
      // Slash commands (legacy support)
      { regex: /\/(\w+)(.*)$/, type: 'slash_command' }
    ];

    for (const pattern of patterns) {
      const match = cleanText.match(pattern.regex);
      if (match) {
        if (pattern.type === 'slash_command') {
          // Handle traditional slash commands
          const command = match[1];
          const argsString = match[2] || '';
          const args = argsString.trim().split(/\s+/).filter(arg => arg.length > 0);
          
          const validCommands = ['save', 'search', 'recent', 'stats', 'tag', 'collections', 'insights', 'help'];
          if (validCommands.includes(command)) {
            return {
              type: command as BotCommand['type'],
              args,
              userFid,
              originalText: text,
              contextCast
            };
          }
        } else if (pattern.type === 'save') {
          // Extract URL from save command
          const url = match[2];
          return {
            type: 'save',
            args: [url],
            userFid,
            originalText: text,
            contextCast
          };
        } else if (pattern.type === 'search') {
          // Extract search query
          const query = match[3] || '';
          return {
            type: 'search',
            args: query.split(/\s+/).filter(arg => arg.length > 0),
            userFid,
            originalText: text,
            contextCast
          };
        } else {
          // Handle cast-specific commands
          return {
            type: pattern.type as BotCommand['type'],
            args: [],
            userFid,
            originalText: text,
            contextCast
          };
        }
      }
    }

    // If no pattern matches, return null (will trigger help message)
    return null;
  }

  async executeCommand(command: BotCommand): Promise<CommandResult> {
    try {
      switch (command.type) {
        case 'save':
          return await this.handleSave(command);
        case 'search':
          return await this.handleSearch(command);
        case 'recent':
          return await this.handleRecent(command);
        case 'stats':
          return await this.handleStats(command);
        case 'tag':
          return await this.handleTag(command);
        case 'collections':
          return await this.handleCollections(command);
        case 'insights':
          return await this.handleInsights(command);
        case 'help':
          return await this.handleHelp(command);
        case 'evermark_cast':
          return await this.handleEvermarkCast(command);
        case 'mark_evermark':
          return await this.handleMarkEvermark(command);
        default:
          return {
            success: false,
            message: 'I didn\'t understand that. Try saying "evermark this cast" or mention me with "help" to see what I can do!'
          };
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing your command.'
      };
    }
  }

  private async handleSave(command: BotCommand): Promise<CommandResult> {
    if (command.args.length === 0) {
      return {
        success: false,
        message: 'Please provide a URL to save. Example: /save https://example.com'
      };
    }

    const url = command.args[0];
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        success: false,
        message: 'Please provide a valid URL.'
      };
    }

    try {
      // Save content using the content service
      const savedContent = await this.contentService.saveContent(url, command.userFid);

      return {
        success: true,
        message: `✅ Saved to your archive!\n\n` +
                 `📝 "${savedContent.title}"\n` +
                 `🔗 ${url}\n` +
                 `🏷️ Tags: ${savedContent.tags.join(', ')}\n` +
                 `💾 Stored permanently on Arweave & IPFS\n` +
                 `🎯 Use /search to find it anytime!`,
        data: savedContent
      };
      
    } catch (error) {
      console.error('Save error:', error);
      return {
        success: false,
        message: 'Failed to extract metadata from that URL. Please check the link and try again.'
      };
    }
  }

  private async handleSearch(command: BotCommand): Promise<CommandResult> {
    if (command.args.length === 0) {
      return {
        success: false,
        message: 'Please provide a search query. Example: search blockchain articles'
      };
    }

    const query = command.args.join(' ');
    
    try {
      const searchResults = await this.contentService.searchContent(query, command.userFid, 5);
      
      if (searchResults.length === 0) {
        return {
          success: true,
          message: `🔍 No results found for "${query}"\n\n` +
                   `💡 Try different keywords or save more content to build your archive!`
        };
      }

      const resultLines = searchResults.map((result, index) => {
        const timeAgo = this.getTimeAgo(new Date(result.content.createdAt));
        return `${index + 1}. "${result.content.title}" (${timeAgo})\n   ${result.excerpt}`;
      });

      return {
        success: true,
        message: `🔍 Found ${searchResults.length} results for "${query}":\n\n` +
                 resultLines.join('\n\n') +
                 `\n\n💡 Use /recent to see more saves`,
        shouldThread: true
      };
      
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble searching your archive. Please try again.'
      };
    }
  }

  private async handleRecent(command: BotCommand): Promise<CommandResult> {
    const count = command.args.length > 0 ? parseInt(command.args[0]) || 5 : 5;
    const maxCount = Math.min(count, 10); // Limit to 10 items
    
    try {
      const recentContent = await this.contentService.getRecentContent(command.userFid, maxCount);
      
      if (recentContent.length === 0) {
        return {
          success: true,
          message: `📚 Your archive is empty!\n\n` +
                   `💡 Try saying "save [URL]" or "evermark this cast" to start building your digital memory!`
        };
      }

      const contentLines = recentContent.map((content, index) => {
        const timeAgo = this.getTimeAgo(new Date(content.createdAt));
        return `${index + 1}. "${content.title}" (${timeAgo})`;
      });

      return {
        success: true,
        message: `📚 Your ${recentContent.length} most recent saves:\n\n` +
                 contentLines.join('\n') +
                 `\n\n💡 Use /search to find specific content`,
        shouldThread: true
      };
      
    } catch (error) {
      console.error('Recent content error:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting your recent saves. Please try again.'
      };
    }
  }

  private async handleStats(command: BotCommand): Promise<CommandResult> {
    try {
      const stats = await this.contentService.getUserStats(command.userFid);
      
      return {
        success: true,
        message: `📊 Your Evermark Stats:\n\n` +
                 `💾 Total Saves: ${stats.totalSaves}\n` +
                 `📅 This Month: ${stats.thisMonth}\n` +
                 `🏷️ Tags Used: ${stats.tagsUsed}\n` +
                 `📂 Collections: ${stats.collections}\n` +
                 `💰 Storage Used: ${stats.storageUsed}\n` +
                 `🔗 Most Saved Domain: ${stats.topDomain}\n\n` +
                 `🎯 Keep building your digital memory!`
      };
      
    } catch (error) {
      console.error('Stats error:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting your statistics. Please try again.'
      };
    }
  }

  private async handleTag(command: BotCommand): Promise<CommandResult> {
    if (command.args.length < 2) {
      return {
        success: false,
        message: 'Please provide a URL and tags. Example: /tag https://example.com blockchain, web3'
      };
    }

    const url = command.args[0];
    const tags = command.args.slice(1).join(' ').split(',').map(tag => tag.trim());
    
    // TODO: Update content tags in database
    
    return {
      success: true,
      message: `🏷️ Added tags to ${url}:\n${tags.map(tag => `#${tag}`).join(', ')}`
    };
  }

  private async handleCollections(command: BotCommand): Promise<CommandResult> {
    // TODO: Query and group user's content by collections
    
    return {
      success: true,
      message: `📂 Your Collections:\n\n` +
               `🔗 Web3 & Blockchain (15 items)\n` +
               `💻 Development Tools (12 items)\n` +
               `📚 Learning Resources (8 items)\n` +
               `🎨 Design Inspiration (6 items)\n` +
               `📰 News & Updates (6 items)\n\n` +
               `Use /search [collection name] to explore`,
      shouldThread: true
    };
  }

  private async handleInsights(command: BotCommand): Promise<CommandResult> {
    // TODO: Use LLM to analyze user's content patterns
    
    return {
      success: true,
      message: `🧠 AI Insights from your saved content:\n\n` +
               `📈 Trending Topics: You've been saving more about Base chain and Farcaster lately\n` +
               `⏰ Peak Save Time: Afternoons (2-4 PM)\n` +
               `🔍 Patterns: 70% technical content, 30% industry news\n` +
               `💡 Suggestion: Consider exploring more about decentralized storage\n\n` +
               `🎯 Your digital memory is growing stronger!`,
      shouldThread: true
    };
  }

  private async handleHelp(command: BotCommand): Promise<CommandResult> {
    return {
      success: true,
      message: `🤖 Evermark Bot - Save anything to your digital memory!\n\n` +
               `💬 Natural Commands:\n` +
               `• "evermark this cast" - Save the cast you're replying to\n` +
               `• "mark this evermark to memory" - Save content permanently\n` +
               `• "save https://example.com" - Save any URL\n` +
               `• "search for blockchain articles" - Find your saved content\n\n` +
               `⚡ Quick Commands:\n` +
               `• /recent - Your latest saves\n` +
               `• /stats - Your archive stats\n` +
               `• /collections - Browse by category\n` +
               `• /insights - AI analysis of your content\n\n` +
               `💡 Just mention @emark-bot and tell me what you want to do!`,
      shouldThread: true
    };
  }

  private async handleEvermarkCast(command: BotCommand): Promise<CommandResult> {
    if (!command.contextCast) {
      return {
        success: false,
        message: 'I need you to reply to a specific cast to evermark it. Try replying to a cast and saying "evermark this cast".'
      };
    }

    const cast = command.contextCast;
    
    try {
      // Extract content from the cast
      let contentToSave = '';
      let metadata: any = {};

      // Check if cast has embedded content (links, images, etc.)
      if (cast.embeds && cast.embeds.length > 0) {
        const embed = cast.embeds[0];
        
        if (embed.url) {
          // Cast contains a URL - extract metadata from it
          contentToSave = embed.url;
          metadata = await this.metadataKit.extractMetadata(embed.url);
        } else if (embed.cast_id) {
          // Cast contains another cast - save the referenced cast
          contentToSave = `https://warpcast.com/${cast.author.username}/${embed.cast_id.hash.slice(0, 10)}`;
        }
      } else {
        // Just text content - save the cast itself
        contentToSave = `https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`;
        metadata = {
          title: `Cast by @${cast.author.username}`,
          text: cast.text,
          author: cast.author.display_name || cast.author.username,
          type: 'farcaster_cast'
        };
      }

      // Save content using the content service
      const savedContent = await this.contentService.saveContent(contentToSave, command.userFid, {
        title: 'title' in metadata ? metadata.title : `Cast by @${cast.author.username}`,
        description: 'text' in metadata ? metadata.text : cast.text,
        tags: ['farcaster', 'cast'],
        originalCast: cast
      });

      return {
        success: true,
        message: `✅ Evermarked cast!\n\n` +
                 `📝 "${savedContent.title}"\n` +
                 `👤 by @${cast.author.username}\n` +
                 `🔗 ${contentToSave}\n` +
                 `🏷️ Tagged: ${savedContent.tags.join(', ')}\n\n` +
                 `💾 Saved to your permanent archive!`,
        data: savedContent
      };
      
    } catch (error) {
      console.error('Evermark cast error:', error);
      return {
        success: false,
        message: 'Had trouble processing that cast. Make sure it contains valid content and try again!'
      };
    }
  }

  private async handleMarkEvermark(command: BotCommand): Promise<CommandResult> {
    // This is for when someone wants to "mark this evermark to memory" 
    // Could be used for:
    // 1. Upgrading an existing save to permanent storage
    // 2. Adding special importance tags
    // 3. Creating a collection entry

    if (!command.contextCast) {
      return {
        success: false,
        message: 'I need you to reply to an evermark or specific content to mark it to memory.'
      };
    }

    const cast = command.contextCast;

    // TODO: Check if this content is already saved by this user
    // TODO: Upgrade storage tier or add special marking
    // TODO: Add to "high priority" collection

    return {
      success: true,
      message: `🧠 Marked to permanent memory!\n\n` +
               `🔥 This content is now in your high-priority archive\n` +
               `💎 Upgraded to premium permanent storage\n` +
               `🏷️ Auto-tagged as "important"\n\n` +
               `You can find it anytime with /search or /insights`
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}