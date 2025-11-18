import { useState, useEffect, useRef } from 'react';
import { supabase, GiftPartner, PartnerConversation, PartnerMessage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Send, MessageSquare } from 'lucide-react';

type PartnerChatProps = {
  partnerId: string;
  onClose: () => void;
};

export function PartnerChat({ partnerId, onClose }: PartnerChatProps) {
  const { user } = useAuth();
  const [partner, setPartner] = useState<GiftPartner | null>(null);
  const [conversation, setConversation] = useState<PartnerConversation | null>(null);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
    subscribeToMessages();
  }, [partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    if (!user) return;

    try {
      const [partnerResult, conversationResult] = await Promise.all([
        supabase
          .from('gift_partners')
          .select('*')
          .eq('id', partnerId)
          .maybeSingle(),
        supabase
          .from('partner_conversations')
          .select('*')
          .eq('partner_id', partnerId)
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (partnerResult.error) throw partnerResult.error;

      setPartner(partnerResult.data);

      if (conversationResult.data) {
        setConversation(conversationResult.data);
        await loadMessages(conversationResult.data.id);
        await markMessagesAsRead(conversationResult.data.id);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
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
    if (!user) return;

    try {
      await supabase
        .from('partner_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .eq('sender_type', 'partner');

      await supabase
        .from('partner_conversations')
        .update({ unread_user_count: 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel(`partner_chat_${partnerId}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_messages',
        },
        (payload) => {
          const newMsg = payload.new as PartnerMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      let convId = conversation?.id;

      if (!convId) {
        const { data: newConv, error: convError } = await supabase
          .from('partner_conversations')
          .insert({
            partner_id: partnerId,
            user_id: user.id,
            last_message_at: new Date().toISOString(),
            unread_partner_count: 1,
            unread_user_count: 0,
          })
          .select()
          .single();

        if (convError) throw convError;
        convId = newConv.id;
        setConversation(newConv);
      } else {
        await supabase
          .from('partner_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            unread_partner_count: (conversation.unread_partner_count || 0) + 1,
          })
          .eq('id', convId);
      }

      const { error: msgError } = await supabase
        .from('partner_messages')
        .insert({
          conversation_id: convId,
          sender_type: 'user',
          message: newMessage.trim(),
        });

      if (msgError) throw msgError;

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[600px] flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            {partner.logo_url && (
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="w-10 h-10 object-contain rounded"
              />
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{partner.name}</h3>
              <p className="text-sm text-gray-500">Chat with partner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.sender_type === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_type === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
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
      </div>
    </div>
  );
}
