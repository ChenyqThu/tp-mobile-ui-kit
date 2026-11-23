import React from 'react';
import type { TPStepTextProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Structured instructional list matching Figma `Text / Step Text`, `Numbered Text`, and `Bullet Point`.
 */
export const TPStepText: React.FC<TPStepTextProps> = ({
  variant = 'step',
  items,
  className = '',
  style,
}) => {
  return (
    <ol
      className={`tp-step-text tp-step-text--${variant} ${className}`.trim()}
      data-variant={variant}
      style={style}
    >
      {items.map((item, idx) => (
        <li key={item.key ?? idx} className="tp-step-text-item">
          <span className="tp-step-text-marker" aria-hidden="true">
            {variant === 'bullet' ? '•' : variant === 'numbered' ? `${idx + 1}.` : idx + 1}
          </span>
          <div className="tp-step-text-body">
            {item.title !== undefined && <div className="tp-step-text-title">{item.title}</div>}
            <div className="tp-step-text-content">{item.text}</div>
            {item.note !== undefined && <div className="tp-step-text-note">{item.note}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
};
