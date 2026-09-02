/**
 * StarRating component — interactive 1–5 star picker or read-only display.
 *
 * Props:
 *   value: current rating (1-5) or null
 *   onChange: (value) => void  — if provided, stars are clickable
 *   size?: 'sm' | 'md' | 'lg'
 *   showEmpty?: boolean  — show empty stars when value is null
 *   showValue?: boolean  — show numeric value label next to stars (default: true)
 */
import { useState } from 'react';

const StarRating = ({
  value = null,
  onChange,
  size = 'md',
  showEmpty = true,
  showValue = true,
}) => {
  // hoverRating represents temporary hover preview only (0 when not hovering)
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = typeof onChange === 'function';

  const sizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const stars = [1, 2, 3, 4, 5];

  // The actual saved/selected rating from props (source of truth)
  const selectedRating = value != null ? Number(value) : 0;

  // Displayed rating: temporary hover preview takes precedence while hovering,
  // but returns immediately back to selectedRating when mouse leaves.
  const displayedRating = isInteractive && hoverRating > 0 ? hoverRating : selectedRating;

  const handleStarClick = (star) => {
    if (!isInteractive) return;
    onChange(star);
  };

  const handleStarMouseEnter = (star) => {
    if (!isInteractive) return;
    setHoverRating(star);
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setHoverRating(0);
  };

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${sizes[size]}`}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${selectedRating} out of 5`}
      onMouseLeave={handleMouseLeave}
    >
      {stars.map((star) => {
        const filled = star <= Math.round(displayedRating);
        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarMouseEnter(star)}
            onFocus={() => isInteractive && setHoverRating(star)}
            onBlur={() => isInteractive && setHoverRating(0)}
            className={`
              transition-colors duration-150
              ${isInteractive ? 'cursor-pointer hover:scale-110 focus:outline-none' : 'cursor-default'}
              ${filled ? 'text-yellow-400' : showEmpty ? 'text-neutral-200' : 'hidden'}
            `}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            tabIndex={isInteractive ? 0 : -1}
          >
            {filled ? '★' : '☆'}
          </button>
        );
      })}
      {showValue && value != null && (
        <span className="ml-1.5 text-sm text-neutral-500 font-medium select-none">
          {typeof value === 'number' ? (Number.isInteger(value) ? value.toString() : value.toFixed(1)) : value}
        </span>
      )}
    </div>
  );
};

export default StarRating;
