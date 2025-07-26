// frontend/src/components/chat/MessageItem.tsx
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../../types/chat';
import { User } from '../../features/auth/authSlice';

// Helper to format time
const formatTimestamp = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Message Status Icon Component
const MessageStatusIcon: React.FC<{ status: Message['status'] }> = ({ status }) => {
    switch (status) {
        case 'sent':
            return <Check className="w-4 h-4 text-gray-400" />;
        case 'delivered':
            return <CheckCheck className="w-4 h-4 text-gray-400" />;
        case 'read':
            return <CheckCheck className="w-4 h-4 text-blue-500" />;
        default:
            return <Check className="w-4 h-4 text-gray-400" />; // Default to sent
    }
};

interface MessageItemProps {
    message: Message;
    currentUser: User | null;
    onReact: (messageId: string, emoji: string) => void;
}

const QuickReactions = ['👍', '❤️', '😂', '😯', '😢', '🙏'];

export const MessageItem: React.FC<MessageItemProps> = ({ message, currentUser, onReact }) => {
    // >>> ADD THIS CONSOLE.LOG FOR DEBUGGING <<<
    console.log(`Comparing senderId: ${message.senderId} (type: ${typeof message.senderId}) WITH currentUserId: ${currentUser?._id} (type: ${typeof currentUser?._id})`);
    
    const isSentByUser = message.senderId === currentUser?._id;

    return (
        <div
            key={message._id}
            // This parent div controls the left/right alignment
            className={`flex items-end gap-2 w-full group ${isSentByUser ? 'justify-end' : 'justify-start'}`}
        >
            {/* The actual message bubble and its contents */}
            <div className={`flex flex-col max-w-lg p-2 rounded-xl shadow-md relative ${
                    isSentByUser
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' // Sent Message
                        : 'bg-white text-gray-800' // Received Message
                }`}
            >
                {/* >>> FIX #2: THE REACTION UI - shows on hover <<< */}
                <div
                    className={`absolute -top-6 rounded-full bg-white shadow-lg p-1 flex border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        ${isSentByUser ? 'right-4' : 'left-4'}`}
                >
                    {QuickReactions.map(emoji => (
                        <button key={emoji} onClick={() => onReact(message._id, emoji)} className="text-lg p-1 hover:scale-125 transition-transform">
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* Sender name for received group chat messages */}
                {!isSentByUser && message.senderName && (
                    <p className="text-xs font-bold text-indigo-500 mb-1">{message.senderName}</p>
                )}
                
                {/* Message Content */}
                <p className="text-sm break-words">{message.content}</p>

                {/* Displaying existing reactions */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {message.reactions.map((reaction, index) => (
                            <span key={index} className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full cursor-pointer">
                                {reaction.emoji}
                            </span>
                        ))}
                    </div>
                )}
                
                {/* Timestamp and Status */}
                <div className="flex items-center justify-end gap-1 mt-1 text-xs self-end">
                    <span className="opacity-70">{formatTimestamp(message.timestamp)}</span>
                    {/* >>> FIX #3: THE STATUS ICON - now properly displayed for sent messages <<< */}
                    {isSentByUser && <MessageStatusIcon status={message.status} />}
                </div>
            </div>
        </div>
    );
}; 