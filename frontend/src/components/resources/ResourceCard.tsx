import React from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { reactToResource, rateResource, Resource } from '../../features/resources/resourcesSlice';
import { useNavigate } from 'react-router-dom';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleReaction = async (reaction: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(reactToResource({ resourceId: resource._id, reaction })).unwrap();
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
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
          className={`rating-star-emoji ${interactive ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
          onClick={interactive ? () => handleRating(i) : undefined}
          style={{ fontSize: '1.5rem' }}
          title={interactive ? `Rate ${i} stars` : 'Sign in to rate'}
        >
          {starEmoji}
        </span>
      );
    }
    return stars;
  };

  const getReactionButtonClass = (reactionType: string, isActive: boolean) => {
    const baseClass = 'reaction-button flex items-center transition-colors duration-200';
    const activeClass = isActive ? 'active' : '';
    return `${baseClass} ${activeClass}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase">
            {resource.category || 'General'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{resource.title}</h3>
        <div className="text-gray-700 dark:text-gray-300 text-sm resource-content mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {resource.content}
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        {/* Reaction Buttons */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {user ? 'How did you find this resource?' : 'Community Reactions'}
          </h4>
          <div className="flex items-center space-x-4">
            <button 
              className={`${getReactionButtonClass('helpful', resource.userReaction === 'helpful')} flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${!user ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => handleReaction('helpful')}
              title={user ? 'Helpful' : 'Sign in to react'}
              data-reaction="helpful"
              disabled={!user}
            >
              <i className="fas fa-thumbs-up text-lg"></i>
              <span className="font-medium text-gray-900 dark:text-white">{resource.reactions.helpful}</span>
            </button>
            <button 
              className={`${getReactionButtonClass('unhelpful', resource.userReaction === 'unhelpful')} flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${!user ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => handleReaction('unhelpful')}
              title={user ? 'Not Helpful' : 'Sign in to react'}
              data-reaction="unhelpful"
              disabled={!user}
            >
              <i className="fas fa-thumbs-down text-lg"></i>
              <span className="font-medium text-gray-900 dark:text-white">{resource.reactions.unhelpful}</span>
            </button>
          </div>
          {!user && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Sign in to react to this resource
            </p>
          )}
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <span className="text-sm font-medium mr-2">
              {user ? 'Rate this resource:' : 'Community Rating:'}
            </span>
            <div className="rating-stars">
              {renderStars(resource.userRating || 0, !!user)}
            </div>
          </div>
          
          {/* Average Rating Display */}
          {resource.averageRating && resource.averageRating > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>Average: {resource.averageRating.toFixed(1)}</span>
              <span className="ml-2">({resource.totalRatings || 0} ratings)</span>
            </div>
          )}
        </div>
        {!user && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Sign in to rate this resource
          </p>
        )}
      </div>
    </div>
  );
};

export default ResourceCard; 