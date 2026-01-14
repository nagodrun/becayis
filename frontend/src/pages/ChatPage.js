import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Send, Phone, Mail, ArrowLeft, Ban, MoreVertical } from 'lucide-react';
import { formatDate } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Determine WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.REACT_APP_BACKEND_URL?.replace(/^https?:\/\//, '').replace(/\/api$/, '') || window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/${token}`;

    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message' && data.conversation_id === conversationId) {
            setMessages(prev => [...prev, data.message]);
            scrollToBottom();
            
            // Mark as read
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'read',
                conversation_id: conversationId
              }));
            }
          } else if (data.type === 'typing' && data.conversation_id === conversationId) {
            setOtherUserTyping(true);
            setTimeout(() => setOtherUserTyping(false), 2000);
          } else if (data.type === 'error') {
            toast.error(data.message);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [conversationId, scrollToBottom]);

  // Fetch initial messages
  useEffect(() => {
    let isMounted = true;
    
    const loadMessages = async () => {
      try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        if (isMounted) {
          setMessages(response.data.messages);
          setParticipants(response.data.participants);
          setLoading(false);
          
          // Mark messages as read via WebSocket
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'read',
              conversation_id: conversationId
            }));
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Mesajlar yüklenemedi');
          navigate('/dashboard');
        }
      }
    };
    
    loadMessages();
    
    return () => {
      isMounted = false;
    };
  }, [conversationId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Try WebSocket first
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        conversation_id: conversationId,
        content: newMessage
      }));
      setNewMessage('');
    } else {
      // Fallback to HTTP
      try {
        await api.post('/messages', {
          conversation_id: conversationId,
          content: newMessage
        });
        setNewMessage('');
        fetchMessages();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Mesaj gönderilemedi');
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && wsRef.current?.readyState === WebSocket.OPEN) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversationId
      }));
    }

    // Reset typing indicator after 2 seconds of no input
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleBlockUser = async () => {
    const otherParticipant = participants.find(p => p.user_id !== user.id);
    if (!otherParticipant) return;

    if (!window.confirm(`${otherParticipant.display_name} kullanıcısını engellemek istediğinizden emin misiniz?`)) return;

    try {
      await api.post('/block', { blocked_user_id: otherParticipant.user_id });
      toast.success('Kullanıcı engellendi');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kullanıcı engellenemedi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  const otherParticipant = participants.find(p => p.user_id !== user.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} data-testid="back-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                  {otherParticipant?.avatar_url ? (
                    <img src={otherParticipant.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">
                      {(otherParticipant?.display_name?.[0] || '?').toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-lg text-foreground">{otherParticipant?.display_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {otherUserTyping ? (
                      <span className="text-emerald-500">Yazıyor...</span>
                    ) : (
                      otherParticipant?.institution
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center" data-testid="contact-phone">
                  <Phone className="w-4 h-4 mr-2" />
                  {otherParticipant?.phone}
                </div>
                <div className="flex items-center" data-testid="contact-email">
                  <Mail className="w-4 h-4 mr-2" />
                  {otherParticipant?.email}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                    <Ban className="w-4 h-4 mr-2" />
                    Kullanıcıyı Engelle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-6 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4" data-testid="messages-container">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Henüz mesaj yok. Konuşmaya başlayın!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  data-testid="message"
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.sender_id === user.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-foreground'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.sender_id === user.id ? 'text-amber-100' : 'text-muted-foreground'
                      }`}
                    >
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={handleTyping}
              placeholder="Mesajınızı yazın..."
              className="flex-1"
              data-testid="message-input"
            />
            <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" data-testid="send-message-button">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
