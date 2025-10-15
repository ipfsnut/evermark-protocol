import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { BotCommandProcessor } from '@/lib/bot/commandProcessor';
import { BotResponseSender } from '@/lib/bot/responseSender';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-neynar-signature');
    
    // Verify webhook signature from Neynar
    const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('NEYNAR_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify the webhook signature
    const hmac = createHmac('sha512', webhookSecret);
    hmac.update(body);
    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log('Bot webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'cast.created':
        await handleCastCreated(event.data);
        break;
        
      case 'user.followed':
        await handleUserFollowed(event.data);
        break;
        
      case 'reaction.created':
        await handleReactionCreated(event.data);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Bot webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleCastCreated(castData: any) {
  const { cast } = castData;
  
  // Check if this cast mentions our bot
  const botUsername = process.env.BOT_USERNAME || 'emark-bot';
  const isBotMention = cast.text.includes(`@${botUsername}`) || 
                     cast.mentions?.some((mention: any) => mention.username === botUsername);
  
  if (!isBotMention) {
    return;
  }

  console.log('Bot mentioned in cast:', cast.hash);
  
  try {
    // Get context cast if this is a reply
    let contextCast = null;
    if (cast.parent_hash) {
      // This is a reply - the parent cast is what they want to evermark
      // TODO: Fetch parent cast details from Neynar
      console.log('Reply detected, parent hash:', cast.parent_hash);
      // For now, we'll pass the cast itself as context
      contextCast = cast;
    }
    
    // Extract command from cast text
    const commandProcessor = new BotCommandProcessor();
    const command = await commandProcessor.parseCommand(cast.text, cast.author.fid, contextCast);
    
    if (!command) {
      // No valid command found, send help message
      const responseSender = new BotResponseSender();
      await responseSender.sendHelpMessage(cast.author.fid, cast.hash);
      return;
    }

    // Process the command
    const result = await commandProcessor.executeCommand(command);
    
    // Send response
    const responseSender = new BotResponseSender();
    await responseSender.sendCommandResponse(cast.author.fid, cast.hash, result);
    
  } catch (error) {
    console.error('Error processing bot command:', error);
    
    // Send error response to user
    const responseSender = new BotResponseSender();
    await responseSender.sendErrorResponse(
      cast.author.fid, 
      cast.hash, 
      'Sorry, I encountered an error processing your request. Please try again.'
    );
  }
}

async function handleUserFollowed(followData: any) {
  const { follower, target } = followData;
  
  // Check if someone followed our bot
  const botFid = parseInt(process.env.BOT_FID || '0');
  if (target.fid === botFid) {
    console.log(`New follower: ${follower.username} (${follower.fid})`);
    
    // Send welcome message to new follower
    const responseSender = new BotResponseSender();
    await responseSender.sendWelcomeMessage(follower.fid);
  }
}

async function handleReactionCreated(reactionData: any) {
  const { reaction } = reactionData;
  
  // Check if someone liked our bot's cast
  const botFid = parseInt(process.env.BOT_FID || '0');
  if (reaction.cast.author.fid === botFid && reaction.reaction_type === 'like') {
    console.log(`Cast liked by ${reaction.user.username}: ${reaction.cast.hash}`);
    
    // Could track engagement metrics here
    // Could send thank you notification for important interactions
  }
}