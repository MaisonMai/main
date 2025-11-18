import { useState, useEffect, useRef } from 'react';
import { supabase, PartnerConversation, PartnerMessage, GiftPartner } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, User, ArrowLeft } from 'lucide-react';

type ConversationWithUser = PartnerConversation & {
  user_email: string;
};

type VendorMessagesProps = {
  partner: GiftPartner;
};

export function VendorMessages({ partner }: VendorMessagesProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUser | null>(null);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, [partner.id]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_conversations')
        .select(`
          *,
          user_email:auth.users(email)
        `)
        .eq('partner_id', partner.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithEmail = (data || []).map((conv: any) => ({
        ...conv,
        user_email: conv.user_email?.email || 'Unknown User',
      }));

      setConversations(conversationsWithEmail);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('partner_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('partner_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .eq('sender_type', 'user');

      await supabase
        .from('partner_conversations')
        .update({ unread_partner_count: 0 })
        .eq('id', conversationId);

      loadConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel(`vendor_conversations_${partner.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_conversations',
          filter: `partner_id=eq.${partner.id}`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`vendor_messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as PartnerMessage;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.sender_type === 'user') {
            markMessagesAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await supabase
        .from('partner_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          unread_user_count: (selectedConversation.unread_user_count || 0) + 1,
        })
        .eq('id', selectedConversation.id);

      const { error } = await supabase
        .from('partner_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: 'partner',
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading messages...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No messages yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Conversations will appear here when customers message you
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      <div className="md:col-span-1 bg-white rounded-lg border border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Conversations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{conv.user_email}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </p>
                  {conv.unread_partner_count > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {conv.unread_partner_count} new
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedConversation.user_email}</h3>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'partner' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.sender_type === 'partner'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_type === 'partner' ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
