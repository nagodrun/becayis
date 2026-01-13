import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Send, Phone, Mail, ArrowLeft } from 'lucide-react';
import { formatDate } from '../lib/utils';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
      setParticipants(response.data.participants);
      setLoading(false);
    } catch (error) {
      if (loading) {
        toast.error('Mesajlar yüklenemedi');
        navigate('/dashboard');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Yüklüyor...</div>
      </div>
    );
  }

  const otherParticipant = participants.find(p => p.user_id !== user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} data-testid="back-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="font-semibold text-lg">{otherParticipant?.display_name}</div>
                <div className="text-sm text-slate-500">{otherParticipant?.institution}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center" data-testid="contact-phone">
                <Phone className="w-4 h-4 mr-2" />
                {otherParticipant?.phone}
              </div>
              <div className="flex items-center" data-testid="contact-email">
                <Mail className="w-4 h-4 mr-2" />
                {otherParticipant?.email}
              </div>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-6 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4" data-testid="messages-container">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
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
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.sender_id === user.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.sender_id === user.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1"
              data-testid="message-input"
            />
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800" data-testid="send-message-button">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;