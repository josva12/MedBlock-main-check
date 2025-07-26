// frontend/src/components/chat/MessageItem.tsx
import React, { useState } from 'react';
import { Check, CheckCheck, Paperclip, Download, Play, FileText } from 'lucide-react';
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
    onRemoveReaction?: (messageId: string, emoji: string) => void;
}

const QuickReactions = ['👍', '❤️', '😂', '😯', '😢', '🙏'];

export const MessageItem: React.FC<MessageItemProps> = ({ message, currentUser, onReact, onRemoveReaction }) => {
    const isSentByUser = (message.senderId as any)?._id === currentUser?._id;
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Helper function to render media content
    const renderMediaContent = () => {
        if (!message.fileUrl) return null;

        const isImage = message.messageType === 'image';
        const isVideo = message.messageType === 'video';
        const isAudio = message.messageType === 'audio';
        const isFile = message.messageType === 'file';

        if (isImage) {
            return (
                <div className="mt-2">
                    <img 
                        src={`http://localhost:5000${message.fileUrl}`} 
                        alt="Media" 
                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(`http://localhost:5000${message.fileUrl}`, '_blank')}
                    />
                </div>
            );
        }

        if (isVideo) {
            return (
                <div className="mt-2">
                    <video 
                        controls 
                        className="max-w-full rounded-lg"
                        preload="metadata"
                    >
                        <source src={`http://localhost:5000${message.fileUrl}`} type={message.mimeType} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        if (isAudio) {
            return (
                <div className="mt-2">
                    <audio controls className="w-full">
                        <source src={`http://localhost:5000${message.fileUrl}`} type={message.mimeType} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        }

        if (isFile) {
            return (
                <div className="mt-2 p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                    <FileText className="w-8 h-8 text-gray-500" />
                    <div className="flex-1">
                        <p className="font-medium text-sm">{message.fileName}</p>
                        <p className="text-xs text-gray-500">
                            {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                        </p>
                    </div>
                    <a 
                        href={`http://localhost:5000${message.fileUrl}`} 
                        download={message.fileName}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                </div>
            );
        }

        return null;
    };

    return (
        <div
            key={message._id}
            // This parent div controls the left/right alignment
            className={`flex items-end gap-2 w-full group ${isSentByUser ? 'justify-end' : 'justify-start'}`}
        >
            {/* The actual message bubble and its contents */}
            <div className={`relative max-w-xs lg:max-w-md p-3 rounded-lg shadow-md ${
                    isSentByUser
                        ? 'bg-blue-500 text-white rounded-br-none' // Sent Message
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none' // Received Message
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

                {/* Sender name for received messages */}
                {!isSentByUser && (
                    <div className="font-semibold text-sm mb-1">
                        {message.senderName}
                    </div>
                )}

                {/* Conditional rendering for text or media */}
                {message.fileUrl ? (
                    message.mimeType?.startsWith('image/') ? (
                        <img src={`http://localhost:5000${message.fileUrl}`} alt="Chat Media" className="chat-media-content" />
                    ) : message.mimeType?.startsWith('video/') ? (
                        <video src={`http://localhost:5000${message.fileUrl}`} controls className="chat-media-content" />
                    ) : (
                        <p className="break-words text-red-500">Unsupported media type.</p>
                    )
                ) : (
                    <p className="break-words">{message.content}</p>
                )}

                {/* Message footer (Time and Reaction Button) */}
                <div className={`text-xs mt-1 ${
                    isSentByUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                } flex justify-between items-center`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    <div className="flex items-center gap-1">
                        {isSentByUser && <MessageStatusIcon status={message.status} />}
                    </div>
                </div>

                {/* Reaction Display on Edges */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-gray-200 dark:bg-gray-800 rounded-full p-1 text-xs shadow-md flex items-center justify-center min-w-[24px] min-h-[24px]">
                        {/* Display unique reactions, or just the first few if many */}
                        {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, index) => (
                            <span key={index}>{emoji}</span>
                        ))}
                        {message.reactions.length > 1 && (
                            <span className="ml-1 text-gray-600 dark:text-gray-400">
                                {message.reactions.length}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 