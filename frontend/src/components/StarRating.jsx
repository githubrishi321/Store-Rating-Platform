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
import { Star } from 'lucide-react';

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
    sm: 14,
    md: 20,
    lg: 26,
  };

  const px = sizes[size];
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
      className="inline-flex items-center gap-0.5"
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
              transition-all duration-100
              ${isInteractive
                ? 'cursor-pointer hover:scale-110 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 rounded-sm'
                : 'cursor-default pointer-events-none'}
              ${!filled && !showEmpty ? 'hidden' : ''}
            `}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            tabIndex={isInteractive ? 0 : -1}
          >
            <Star
              size={px}
              strokeWidth={filled ? 0 : 1.5}
              fill={filled ? 'currentColor' : 'none'}
              stroke={filled ? 'none' : 'currentColor'}
              className={filled ? 'text-amber-400' : 'text-slate-200'}
            />
          </button>
        );
      })}
      {showValue && value != null && (
        <span className="ml-1.5 text-sm text-slate-500 font-medium select-none tabular-nums">
          {typeof value === 'number'
            ? (Number.isInteger(value) ? value.toString() : value.toFixed(1))
            : value}
        </span>
      )}
    </div>
  );
};

export default StarRating;
