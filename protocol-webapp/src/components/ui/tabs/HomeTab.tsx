"use client";

import { useState } from "react";
import { Button } from "../Button";

/**
 * HomeTab component displays the main Evermark Protocol interface.
 * 
 * This is the primary content creation interface where users can:
 * - Submit URLs to create new Evermarks
 * - View recent activity and stats
 * - Access core Evermark functionality
 */
export function HomeTab() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreateEvermark = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      // Call everservice API to create evermark
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/evermarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Evermark created! Token ID: ${data.tokenId}`);
        setUrl("");
      } else {
        const error = await response.json();
        setResult(`❌ Error: ${error.message || 'Failed to create Evermark'}`);
      }
    } catch (error) {
      console.error("Error creating Evermark:", error);
      setResult(`❌ Network error. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleCreateEvermark();
    }
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6 px-6 w-full max-w-md mx-auto">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Create Evermark</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Preserve content permanently on-chain with LLM-powered tagging
        </p>
      </div>

      {/* Create Evermark Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste URL (Twitter, Farcaster cast, article, etc.)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
            disabled={isProcessing}
          />
          
          <Button 
            onClick={handleCreateEvermark}
            disabled={!url.trim() || !isValidUrl(url.trim()) || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              "🔖 Create Evermark"
            )}
          </Button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.startsWith('✅') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {result}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3 text-sm">
        <h4 className="font-semibold">What happens when you create an Evermark?</h4>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <span className="text-lg">🧠</span>
            <div>
              <div className="font-medium">AI Content Analysis</div>
              <div className="text-xs">LLM extracts key information and generates semantic tags</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">💎</span>
            <div>
              <div className="font-medium">NFT Creation</div>
              <div className="text-xs">Content becomes a unique NFT on Base blockchain</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🔗</span>
            <div>
              <div className="font-medium">Permanent Storage</div>
              <div className="text-xs">Stored permanently on Arweave + IPFS</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🗳️</span>
            <div>
              <div className="font-medium">Community Curation</div>
              <div className="text-xs">Others can vote to boost quality content</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-sm">Try these examples:</h4>
        <div className="space-y-2 text-xs">
          <button
            onClick={() => setUrl("https://twitter.com/balajis/status/123456789")}
            className="w-full text-left p-2 bg-white dark:bg-gray-700 rounded border hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isProcessing}
          >
            📱 Twitter post
          </button>
          <button
            onClick={() => setUrl("https://warpcast.com/balajis/0x12345678")}
            className="w-full text-left p-2 bg-white dark:bg-gray-700 rounded border hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isProcessing}
          >
            🌟 Farcaster cast
          </button>
          <button
            onClick={() => setUrl("https://github.com/example/repo")}
            className="w-full text-left p-2 bg-white dark:bg-gray-700 rounded border hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isProcessing}
          >
            💻 GitHub repository
          </button>
        </div>
      </div>
    </div>
  );
} 