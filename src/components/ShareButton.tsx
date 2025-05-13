import { useState } from 'react';

type ShareButtonProps = {
  url: string;
  title?: string;
  className?: string;
};

const ShareButton = ({ url, title = 'Share', className = '' }: ShareButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Movie Ratings',
        text: 'Check out these movie ratings!',
        url: url
      })
      .catch(err => {
        console.error('Error sharing: ', err);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center ${className}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {title}
        {showTooltip && (
          <span className="absolute bg-black text-white px-2 py-1 rounded text-sm -bottom-8 right-0 whitespace-nowrap">
            Link copied!
          </span>
        )}
      </button>
    </div>
  );
};

export default ShareButton; 