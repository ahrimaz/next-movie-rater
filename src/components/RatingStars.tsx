"use client"

type RatingStarsProps = {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  editable?: boolean;
  onChange?: (rating: number) => void;
};

export const RatingStars = ({
  rating,
  max = 5,
  size = 'md',
  readonly = true,
  editable = false,
  onChange
}: RatingStarsProps) => {
  const sizeClass = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const isInteractive = editable || !readonly;

  const handleClick = (index: number) => {
    if (isInteractive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex">
      {[...Array(max)].map((_, i) => (
        <span
          key={i}
          className={`${sizeClass} ${isInteractive ? 'cursor-pointer hover:text-yellow-500' : ''} ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          onClick={() => handleClick(i)}
          title={`${i + 1} stars`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars; 