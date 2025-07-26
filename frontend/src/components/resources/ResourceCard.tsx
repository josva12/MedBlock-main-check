import React from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { reactToResource, rateResource, Resource } from '../../features/resources/resourcesSlice';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const dispatch = useAppDispatch();

  const handleReaction = async (reaction: string) => {
    try {
      await dispatch(reactToResource({ resourceId: resource._id, reaction })).unwrap();
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      await dispatch(rateResource({ resourceId: resource._id, rating })).unwrap();
    } catch (error) {
      console.error('Failed to rate:', error);
    }
  };

  const renderStars = (rating: number = 0, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starEmoji = i <= rating ? '⭐' : '☆';
      stars.push(
        <span
          key={i}
          className={`rating-star-emoji ${interactive ? 'cursor-pointer' : ''}`}
          onClick={interactive ? () => handleRating(i) : undefined}
          style={{ fontSize: '1.5rem' }}
        >
          {starEmoji}
        </span>
      );
    }
    return stars;
  };

  const getReactionButtonClass = (reactionType: string, isActive: boolean) => {
    const baseClass = 'flex items-center space-x-1 transition';
    const activeClass = isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-600';
    return `${baseClass} ${activeClass}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">
            {resource.category || 'General'}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
        <div className="text-gray-700 text-sm resource-content mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {resource.content}
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          {/* Thumbs Up/Down Reactions */}
          <div className="flex items-center space-x-4">
            <button 
              className={getReactionButtonClass('helpful', resource.userReaction === 'helpful')}
              onClick={() => handleReaction('helpful')}
            >
              <i className="fa-regular fa-thumbs-up text-lg"></i>
              <span>{resource.reactions.helpful}</span>
            </button>
            <button 
              className={getReactionButtonClass('unhelpful', resource.userReaction === 'unhelpful')}
              onClick={() => handleReaction('unhelpful')}
            >
              <i className="fa-regular fa-thumbs-down text-lg"></i>
              <span>{resource.reactions.unhelpful}</span>
            </button>
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-sm font-medium mr-2">Rate:</span>
            <div className="rating-stars">
              {renderStars(resource.userRating || 0, true)}
            </div>
          </div>
        </div>
        
        {/* Average Rating Display */}
        {resource.averageRating && resource.averageRating > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Average Rating: {resource.averageRating.toFixed(1)}</span>
            <span>({resource.totalRatings || 0} ratings)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCard; 