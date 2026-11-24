import React from 'react';
import type { TPLoadMoreProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * List bottom footer displaying Load More trigger, Loading spinner, End-of-list state, or Retry action.
 */
export const TPLoadMore: React.FC<TPLoadMoreProps> = ({
  status = 'idle',
  idleText = 'Load more',
  loadingText = 'Loading...',
  noMoreText = 'No more data',
  errorText = 'Failed to load. Tap to retry',
  onLoadMore,
  onRetry,
  className = '',
  style,
}) => {
  const rootClass = [
    'tp-load-more',
    `tp-load-more--${status}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} data-status={status} style={style}>
      {status === 'loading' && (
        <span className="tp-load-more-status" role="status">
          <span className="tp-load-more-spinner" aria-hidden="true" />
          <span>{loadingText}</span>
        </span>
      )}

      {status === 'idle' && (
        <button
          type="button"
          className="tp-load-more-btn"
          onClick={onLoadMore}
        >
          {idleText}
        </button>
      )}

      {status === 'error' && (
        <button
          type="button"
          className="tp-load-more-btn tp-load-more-btn--error"
          onClick={onRetry ?? onLoadMore}
        >
          {errorText}
        </button>
      )}

      {status === 'no-more' && (
        <span className="tp-load-more-divider">
          <span className="tp-load-more-line" aria-hidden="true" />
          <span className="tp-load-more-end-text">{noMoreText}</span>
          <span className="tp-load-more-line" aria-hidden="true" />
        </span>
      )}
    </div>
  );
};
