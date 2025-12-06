
import React from 'react';

interface HeroHighlight {
  label: string;
  value: string;
}

type HighlightPlacement = 'stack' | 'side';
type EyebrowPlacement = 'above' | 'inline-before' | 'inline-after';

interface PageHeroProps {
  title: string;
  description: React.ReactNode;
  eyebrow?: string;
  align?: 'left' | 'center';
  highlights?: HeroHighlight[];
  actions?: React.ReactNode;
  highlightPlacement?: HighlightPlacement;
  eyebrowPlacement?: EyebrowPlacement;
  theme?: 'dark' | 'light';
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  eyebrow,
  align = 'center',
  highlights = [],
  actions,
  highlightPlacement = 'stack',
  eyebrowPlacement = 'above',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const baseAlignmentClasses =
    align === 'center'
      ? 'items-center text-center'
      : 'items-start text-left';

  const descriptionConstraints =
    align === 'center' ? 'mx-auto' : '';

  const textAlignmentClasses =
    highlightPlacement === 'side' && align === 'center'
      ? 'items-center text-center lg:items-start lg:text-left'
      : baseAlignmentClasses;

  const isInlineEyebrow = eyebrowPlacement !== 'above';

  const titleClasses = [
    'text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl',
    isLight ? 'text-slate-900' : 'text-white',
    isInlineEyebrow ? 'flex flex-wrap items-center gap-3' : '',
    isInlineEyebrow && align === 'center' ? 'justify-center lg:justify-start' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderEyebrowBadge = () =>
    eyebrow ? (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${isLight
            ? 'border-slate-300/70 bg-white text-slate-700'
            : 'border-white/10 bg-white/5 text-blue-200'
          }`}
      >
        {eyebrow}
      </span>
    ) : null;

  const renderHighlights = (placement: HighlightPlacement) => {
    if (!highlights.length) return null;

    const wrapperClasses =
      placement === 'side'
        ? 'w-full sm:w-auto lg:w-[520px]'
        : 'w-full';

    const gridClasses =
      placement === 'side'
        ? 'grid grid-cols-2 gap-2 sm:gap-3'
        : 'grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3';

    const cardClasses =
      placement === 'side'
        ? isLight
          ? 'rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm'
          : 'rounded-2xl border border-white/35 bg-white/[0.06] px-3 py-2 text-left text-sm shadow-[0_12px_32px_rgba(8,15,40,0.35)] backdrop-blur-md'
        : isLight
          ? 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.09)]'
          : 'rounded-2xl border border-white/25 bg-white/[0.07] px-4 py-3 text-left shadow-[0_8px_24px_rgba(8,15,40,0.28)]';

    return (
      <div className={wrapperClasses}>
        <div className={gridClasses}>
          {highlights.map((highlight) => (
            <div key={highlight.label} className={cardClasses}>
              <p
                className={`text-[0.65rem] font-semibold uppercase tracking-[0.25em] ${isLight ? 'text-slate-500' : 'text-blue-200/80'
                  }`}
              >
                {highlight.label}
              </p>
              <p
                className={`text-xl font-semibold sm:text-2xl ${isLight ? 'text-slate-900' : 'text-white'
                  }`}
              >
                {highlight.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTitleBlock = () => (
    <div className="space-y-2">
      <h1 className={titleClasses}>
        {eyebrow && eyebrowPlacement === 'inline-before' && renderEyebrowBadge()}
        {isLight ? (
          <span>{title}</span>
        ) : (
          <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
            {title}
          </span>
        )}
        {eyebrow && eyebrowPlacement === 'inline-after' && renderEyebrowBadge()}
      </h1>
      <p
        className={`text-base sm:text-lg ${descriptionConstraints} max-w-3xl ${isLight ? 'text-slate-600' : 'text-slate-200/90'
          }`}
      >
        {description}
      </p>
    </div>
  );

  return (
    <section
      className={`relative rounded-[32px] px-3 py-2 sm:px-4 sm:py-2 ${isLight ? 'text-slate-900' : 'text-white'
        }`}
    >
      {highlightPlacement === 'side' ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className={`flex flex-col gap-3 w-full ${textAlignmentClasses}`}>
            {eyebrow && eyebrowPlacement === 'above' && renderEyebrowBadge()}
            {renderTitleBlock()}

            {actions && (
              <div className={`flex w-full flex-col gap-3 sm:flex-row ${align === 'center' ? 'sm:justify-center lg:justify-start' : ''}`}>
                {actions}
              </div>
            )}
          </div>
          {renderHighlights('side')}
        </div>
      ) : (
        <div className={`flex flex-col gap-3 ${textAlignmentClasses}`}>
          {eyebrow && eyebrowPlacement === 'above' && renderEyebrowBadge()}
          {renderTitleBlock()}

          {actions && (
            <div className={`flex w-full flex-col gap-3 sm:flex-row ${align === 'center' ? 'sm:justify-center' : ''}`}>
              {actions}
            </div>
          )}

          {renderHighlights('stack')}
        </div>
      )}
    </section>
  );
};

export default PageHero;

