import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Game, GamePlayer, User, Message } from "@shared/schema";
import GameStone from "./GameStone";
import VoiceChat from "./VoiceChat";
import { Volume2, VolumeX, Music, MessageSquare, Send, Bell, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  playBackgroundMusic, 
  stopBackgroundMusic, 
  updateSoundSettings, 
  soundSettings
} from "@/lib/sounds";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface CleanGameBoardProps {
  gameId: number;
  players: (GamePlayer & { user: User })[];
  currentPlayer: GamePlayer & { user: User };
  game: Game;
  messages: Message[];
}

export default function CleanGameBoard({ 
  gameId, 
  players, 
  currentPlayer, 
  game, 
  messages 
}: CleanGameBoardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { speak, cancel, speaking } = useSpeechSynthesis();
  
  // Game state
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedStone, setSelectedStone] = useState<number | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(null);

  // Computer voice announcements
  const announceWinner = (stoneNumber: number, username: string) => {
    let message = "";
    if (stoneNumber === 3355) {
      message = `Stone 3355 wins! ${username} wins with triple payout! Incredible luck!`;
    } else if (stoneNumber === 6624) {
      message = `Stone 6624 wins! ${username} takes the super prize! Amazing!`;
    } else if (stoneNumber === 1000) {
      message = `Stone 1000 wins! ${username} gets double payout! Well done!`;
    } else if (stoneNumber === 500) {
      message = `Stone 500 wins! ${username} gets double payout! Congratulations!`;
    } else {
      message = `Stone ${stoneNumber} wins! ${username} takes the prize! Great roll!`;
    }
    
    speak(message, { rate: 0.8, pitch: 0.7, volume: 0.9 });
  };

  // Check if current player has already rolled
  useEffect(() => {
    if (currentPlayer?.rolledNumber !== null) {
      setHasRolled(true);
      setSelectedStone(currentPlayer.rolledNumber);
    }
  }, [currentPlayer]);

  // Winner announcement effect
  useEffect(() => {
    if (game.status === "completed" && game.winnerIds && game.winningNumber) {
      const winners = players.filter(p => game.winnerIds?.includes(p.userId));
      
      if (winners.length > 0) {
        setTimeout(() => {
          if (winners.length === 1) {
            announceWinner(game.winningNumber, winners[0].user.username);
          } else {
            const winnerNames = winners.map(w => w.user.username).join(' and ');
            announceWinner(game.winningNumber, winnerNames);
          }
        }, 1000);
      }
    }
  }, [game.status, game.winnerIds, game.winningNumber, players]);

  // Stone layout - matching demo-new board exactly
  const stones = [
    { number: 29, row: 1, index: 0 },
    { number: 40, row: 1, index: 1 },
    { number: 32, row: 1, index: 2 },
    { number: 81, row: 1, index: 3 },
    { number: 7, row: 1, index: 4 },
    { number: 13, row: 2, index: 0 },
    { number: 64, row: 2, index: 1 },
    { number: 1000, row: 2, index: 2, isSpecial: true, size: 'lg' },
    { number: 101, row: 2, index: 3 },
    { number: 4, row: 2, index: 4 },
    { number: 3355, row: 3, index: 0, isSuper: true },
    { number: 65, row: 3, index: 1 },
    { number: 12, row: 3, index: 2 },
    { number: 22, row: 3, index: 3 },
    { number: 9, row: 3, index: 4 },
    { number: 6624, row: 3, index: 5, isSuper: true },
    { number: 44, row: 3, index: 6 },
    { number: 28, row: 4, index: 0 },
    { number: 21, row: 4, index: 1 },
    { number: 105, row: 4, index: 2 },
    { number: 500, row: 4, index: 3, isSpecial: true, size: 'lg' },
    { number: 99, row: 4, index: 4 },
    { number: 20, row: 4, index: 5 },
    { number: 82, row: 4, index: 6 },
    { number: 3, row: 4, index: 7 },
  ];

  // Small stones for the bottom rows
  const smallStones = [
    { number: 11, row: 5, index: 0 },
    { number: 37, row: 5, index: 1 },
    { number: 72, row: 5, index: 2 },
    { number: 17, row: 5, index: 3 },
    { number: 42, row: 5, index: 4 },
    { number: 8, row: 5, index: 5 },
    { number: 30, row: 5, index: 6 },
    { number: 91, row: 5, index: 7 },
    { number: 27, row: 5, index: 8 },
    { number: 5, row: 5, index: 9 },
    { number: 40, row: 5, index: 10 },
    { number: 6, row: 6, index: 0 },
    { number: 80, row: 6, index: 1 },
    { number: 3, row: 6, index: 2 },
    { number: 26, row: 6, index: 3 },
    { number: 100, row: 6, index: 4 },
    { number: 19, row: 6, index: 5 },
    { number: 14, row: 6, index: 6 },
    { number: 43, row: 6, index: 7 },
    { number: 16, row: 6, index: 8 },
    { number: 71, row: 6, index: 9 },
    { number: 10, row: 6, index: 10 },
  ];

  // Roll mutation
  const rollMutation = useMutation({
    mutationFn: async ({ gameId }: { gameId: number }) => {
      const res = await apiRequest("POST", `/api/games/${gameId}/roll`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      setIsRolling(true);
      setSelectedStone(data.rolledNumber);
      
      setTimeout(() => {
        setHasRolled(true);
        setIsRolling(false);
        queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
        
        toast({
          title: "🎲 Roll Complete!",
          description: `You rolled stone ${data.rolledNumber}!`,
        });
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Roll Failed",
        description: error.message || "Failed to submit your roll",
        variant: "destructive",
      });
      setIsRolling(false);
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ gameId, content }: { gameId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/games/${gameId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleRoll = () => {
    if (hasRolled || isRolling) return;
    rollMutation.mutate({ gameId });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    chatMutation.mutate({ gameId, content: newMessage.trim() });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Game Board */}
      <div className="lg:col-span-2 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Game Board</h2>
          
          {/* Sound Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateSoundSettings({ 
                  gameSoundsEnabled: !soundSettings.gameSoundsEnabled 
                });
              }}
              className="flex items-center gap-1"
            >
              {soundSettings.gameSoundsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Sound
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMusicEnabled(!musicEnabled);
                if (!musicEnabled) {
                  playBackgroundMusic("BG_MUSIC_MAIN");
                } else {
                  stopBackgroundMusic();
                }
              }}
              className="flex items-center gap-1"
            >
              <Music className="h-4 w-4" />
              Music
            </Button>
          </div>
        </div>

        {/* Game Status */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">
                Stake: {game.currency} {game.stake.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Total Pot: {game.currency} {game.stakePot.toLocaleString()}
              </p>
            </div>
            <Badge variant={game.status === "completed" ? "default" : "secondary"}>
              {game.status}
            </Badge>
          </div>
        </div>

        {/* Casino-Style Green Felt Game Board */}
        <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-2xl shadow-2xl border-8 border-yellow-600 p-8 mb-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Red Accent Row at Top */}
            <div className="flex justify-center gap-3 mb-6">
              {[28, 21, 105, 500, 99, 20, 82, 3].map((num, index) => (
                <div
                  key={num}
                  className={`
                    w-16 h-20 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg
                    ${num === 500 ? 'bg-yellow-400 text-black border-2 border-yellow-600' : 
                      index === 0 || index === 5 ? 'bg-red-500 text-white border-2 border-red-700' : 
                      'bg-white text-black border-2 border-gray-300'}
                    ${isRolling && selectedStone === num ? 'animate-bounce' : ''}
                    ${game.winningNumber === num && game.status === "completed" ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                    hover:scale-105 transition-transform cursor-pointer
                  `}
                >
                  {num}
                </div>
              ))}
            </div>
            
            {/* Main White Stone Rows */}
            <div className="space-y-4">
              {/* Row 2 */}
              <div className="flex justify-center gap-3">
                {[11, 37, 72, 17, 42, 8, 30, 91, 27, 5, 40].map((num) => (
                  <div
                    key={num}
                    className={`
                      w-16 h-20 bg-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg border-2 border-gray-300
                      ${isRolling && selectedStone === num ? 'animate-bounce' : ''}
                      ${game.winningNumber === num && game.status === "completed" ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                      hover:scale-105 transition-transform cursor-pointer
                    `}
                  >
                    {num}
                  </div>
                ))}
              </div>
              
              {/* Row 3 */}
              <div className="flex justify-center gap-3">
                {[6, 80, 3, 26, 100, 19, 14, 43, 16, 71, 10].map((num) => (
                  <div
                    key={num}
                    className={`
                      w-16 h-20 bg-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg border-2 border-gray-300
                      ${isRolling && selectedStone === num ? 'animate-bounce' : ''}
                      ${game.winningNumber === num && game.status === "completed" ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                      hover:scale-105 transition-transform cursor-pointer
                    `}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Golden Roll Button */}
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleRoll}
                disabled={hasRolled || isRolling}
                className="
                  bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700
                  text-black font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl border-4 border-yellow-300
                  transform hover:scale-105 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                "
                size="lg"
              >
                {isRolling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    🌀 ROLLING...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    🎲 ROLL STONE
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
              
              {/* Row 6 - 11 small stones */}
              <div className="flex justify-center gap-2">
                {smallStones.filter(s => s.row === 6).map((stone) => (
                  <GameStone
                    key={stone.number}
                    number={stone.number}
                    isRolling={isRolling && selectedStone === stone.number}
                    size="sm"
                    isWinner={game.winningNumber === stone.number && game.status === "completed"}
                  />
                ))}
              </div>
            </div>

            {/* Roll Button */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleRoll}
                disabled={hasRolled || isRolling || game.status === "completed"}
                size="lg"
                className="px-8 py-3 text-lg font-bold"
              >
                {isRolling ? "🌀 ROLLING..." : hasRolled ? "✅ ROLLED" : "🎲 ROLL STONE"}
              </Button>
            </div>

            {/* Game Result */}
            {game.status === "completed" && game.winningNumber && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Game Complete!</h3>
                <p className="text-green-700">
                  Winning Stone: <span className="font-bold">{game.winningNumber}</span>
                </p>
                {game.winnerIds && (
                  <p className="text-green-700 mt-1">
                    Winners: {players
                      .filter(p => game.winnerIds?.includes(p.userId))
                      .map(p => p.user.username)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Players ({players.length}/{game.maxPlayers})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{player.user.username}</p>
                    <p className="text-sm text-gray-600">
                      {player.rolledNumber !== null ? `Rolled: ${player.rolledNumber}` : "Waiting to roll..."}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.user.avatarInitials}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:w-80 space-y-6">
        {/* Voice Chat */}
        {game.voiceChatEnabled && (
          <VoiceChat game={game} />
        )}

{/* Text Chat replaced with floating button below */}
      </div>

      {/* Notification Badge for Header */}
      {unreadCount > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Badge variant="destructive" className="animate-pulse">
            <Bell className="h-3 w-3 mr-1" />
            {unreadCount} new message{unreadCount > 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Floating Chat Button - Always Visible */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <div className="relative">
          <MessageSquare className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </Button>

      {/* Chat Modal */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Game Chat
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <ScrollArea className="h-80 w-full border rounded-md p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs text-gray-400">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const player = players.find(p => p.userId === message.userId);
                    return (
                      <div key={message.id} className="flex gap-2 text-sm">
                        {player && (
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {player.user.avatarInitials}
                          </div>
                        )}
                        <div className="flex-1">
                          {player && (
                            <div className="font-medium text-gray-900 mb-1">
                              {player.user.username}
                            </div>
                          )}
                          <div className="text-gray-700">{message.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}