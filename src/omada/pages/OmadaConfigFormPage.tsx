import React, { useState } from 'react';
import { TPAlert } from '../../core/components/TPAlert';
import { TPButton } from '../../core/components/TPButton';
import { TPFixedButtonBar } from '../../core/components/TPFixedButtonBar';
import { TPHeader } from '../../core/components/TPHeader';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaConfigFormMode = 'create' | 'edit' | 'subpage';

export interface OmadaConfigFormPageProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  mode?: OmadaConfigFormMode;
  dirty?: boolean;
  saving?: boolean;
  saveText?: string;
  showBottomBar?: boolean;
  secondaryText?: string;
  onSecondaryClick?: () => void;
  onSave?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada configuration form & edit page wrapper implementing create/edit/subpage chrome,
 * Save/Apply header button, and automatic `Discard Changes?` confirmation when navigating back dirty.
 */
export const OmadaConfigFormPage: React.FC<OmadaConfigFormPageProps> = ({
  title,
  subtitle,
  mode = 'edit',
  dirty = false,
  saving = false,
  saveText,
  showBottomBar = false,
  secondaryText,
  onSecondaryClick,
  onSave,
  onBack,
  children,
  className = '',
  style,
}) => {
  const [discardAlertOpen, setDiscardAlertOpen] = useState(false);

  const resolvedSaveText = saveText ?? (mode === 'create' ? 'Create' : 'Save');
  const saveDisabled = saving || (mode === 'edit' && !dirty);

  const handleBackRequest = () => {
    if (dirty && onBack) {
      setDiscardAlertOpen(true);
      return;
    }
    onBack?.();
  };

  return (
    <div
      className={`tp-omada-screen ${className}`.trim()}
      data-testid="omada-config-form-page"
      data-mode={mode}
      data-dirty={String(dirty)}
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="standard"
          title={title}
          subtitle={subtitle}
          left={
            onBack && (
              <button
                type="button"
                className="tp-header-icon-btn"
                aria-label="Back"
                onClick={handleBackRequest}
              >
                <TPIcon name="nav-back" size={20} />
              </button>
            )
          }
          right={
            mode !== 'subpage' && onSave ? (
              <TPButton
                variant="text"
                size="sm"
                loading={saving}
                disabled={saveDisabled}
                onClick={onSave}
              >
                {resolvedSaveText}
              </TPButton>
            ) : undefined
          }
        />
      </div>

      <div className="tp-omada-scroll">
        <div className="tp-omada-body">{children}</div>
      </div>

      {showBottomBar && (
        <TPFixedButtonBar
          layout={secondaryText ? 'dual-horizontal' : 'single'}
          primaryText={resolvedSaveText}
          primaryLoading={saving}
          primaryDisabled={saveDisabled}
          onPrimaryClick={onSave}
          secondaryText={secondaryText}
          onSecondaryClick={onSecondaryClick}
        />
      )}

      <TPAlert
        open={discardAlertOpen}
        title="Discard Changes?"
        message="You have unsaved configuration changes on this page. Leaving now will discard them."
        actions={[
          {
            label: 'Continue Editing',
            role: 'cancel',
            onClick: () => setDiscardAlertOpen(false),
          },
          {
            label: 'Discard',
            role: 'destructive',
            onClick: () => {
              setDiscardAlertOpen(false);
              onBack?.();
            },
          },
        ]}
        onClose={() => setDiscardAlertOpen(false)}
      />
    </div>
  );
};
