"use client"

type RatingStarsProps = {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (rating: number) => void;
};

export const RatingStars = ({
  rating,
  max = 5,
  size = 'md',
  readonly = true,
  onChange
}: RatingStarsProps) => {
  const sizeClass = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex">
      {[...Array(max)].map((_, i) => (
        <span
          key={i}
          className={`${sizeClass} ${!readonly ? 'cursor-pointer' : ''}`}
          onClick={() => handleClick(i)}
        >
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default RatingStars; 