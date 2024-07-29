import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, ChevronDown, ChevronUp, Youtube } from 'lucide-react';
import { decodeHTMLEntities } from '@/utils/helpers';

interface FloatingChatbotProps {
  chatHistory: { role: string; content: string }[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onChatSubmit: () => void;
  convertMarkdownToHtml: (markdown: string) => string;
}

export function FloatingChatbot({
  chatHistory,
  chatInput,
  onChatInputChange,
  onChatSubmit,
  convertMarkdownToHtml
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 320, height: 480 });
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setSize(prevSize => ({
        width: Math.max(320, prevSize.width + e.movementX),
        height: Math.max(400, prevSize.height + e.movementY)
      }));
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card 
          className="flex flex-col shadow-lg transition-all duration-300 ease-in-out"
          style={{ 
            width: `${size.width}px`, 
            height: isMinimized ? '60px' : `${size.height}px`
          }}
        >
          <CardHeader className="flex flex-row justify-between items-center py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-bold">Chat with AI</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20">
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {!isMinimized && (
            <>
              <CardContent 
                ref={chatContentRef}
                className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100"
              >
                {chatHistory.map((message, index) => (
                  <div key={index} className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100 dark:bg-blue-900 ml-4' : 'bg-gray-100 dark:bg-gray-700 mr-4'}`}>
                    <strong className={message.role === 'user' ? 'text-blue-600 dark:text-blue-300' : 'text-green-600 dark:text-green-300'}>
                      {message.role === 'user' ? 'You: ' : 'AI: '}
                    </strong>
                    {message.role === 'user' ? (
                      message.content
                    ) : (
                      <>
                        {(() => {
                          try {
                            const parsedContent = JSON.parse(message.content);
                            return (
                              <>
                                <span dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(parsedContent.answer) }} />
                                {parsedContent.youtubeQuery && (
                                  <a
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(decodeHTMLEntities(parsedContent.youtubeQuery))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center text-blue-500 hover:text-blue-600"
                                  >
                                    <Youtube className="h-4 w-4 mr-2" />
                                    Watch related videos on YouTube
                                  </a>
                                )}
                              </>
                            );
                          } catch {
                            // If parsing fails, it's probably a plain string (like an error message)
                            return <span dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(message.content) }} />;
                          }
                        })()}
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t border-gray-200">
                <div className="flex">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => onChatInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onChatSubmit()}
                    placeholder="Ask a question..."
                    className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                  <Button onClick={onChatSubmit} className="rounded-l-none bg-blue-500 hover:bg-blue-600">
                    Send
                  </Button>
                </div>
              </div>
              <div
                ref={resizeRef}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={() => setIsResizing(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 18 22 12"></polyline>
                  <polyline points="8 6 12 2 12 8"></polyline>
                </svg>
              </div>
            </>
          )}
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
}