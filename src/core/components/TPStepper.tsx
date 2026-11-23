import React from 'react';
import type { TPStepperProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Horizontal or vertical multi-step progress stepper for onboarding and device setup flows.
 */
export const TPStepper: React.FC<TPStepperProps> = ({
  steps,
  current,
  direction = 'horizontal',
  className = '',
  style,
}) => {
  return (
    <ol
      className={`tp-stepper tp-stepper--${direction} ${className}`.trim()}
      data-direction={direction}
      style={style}
    >
      {steps.map((step, idx) => {
        const status = idx < current ? 'done' : idx === current ? 'active' : 'pending';
        return (
          <li
            key={step.key}
            className={`tp-stepper-item tp-stepper-item--${status}`}
            aria-current={status === 'active' ? 'step' : undefined}
          >
            <div className="tp-stepper-node-row">
              <span className="tp-stepper-circle">
                {status === 'done' ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 6.2L5 8.7L9.5 3.6"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              {idx < steps.length - 1 && <span className="tp-stepper-line" aria-hidden="true" />}
            </div>
            <div className="tp-stepper-meta">
              <div className="tp-stepper-title">{step.title}</div>
              {step.description !== undefined && (
                <div className="tp-stepper-desc">{step.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
