interface PageHeroProps {
  eyebrow?: string;
  eyebrowPlacement?: 'inline-before' | 'inline-after' | 'above';
  title: string;
  highlightPlacement?: 'side' | 'below';
  theme?: 'light' | 'dark';
  description?: string;
  highlights?: Array<{ label: string; value: string }>;
}

export default function PageHero({
  eyebrow,
  eyebrowPlacement = 'above',
  title,
  highlightPlacement = 'below',
  theme = 'light',
  description,
  highlights = [],
}: PageHeroProps) {
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-white/80' : 'text-gray-600';

  return (
    <div className="text-center">
      {eyebrow && eyebrowPlacement === 'above' && (
        <p className={`text-sm font-medium uppercase tracking-wider mb-2 ${textSecondaryColor}`}>
          {eyebrow}
        </p>
      )}
      
      <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${textColor}`}>
        {eyebrow && eyebrowPlacement === 'inline-before' && (
          <span className={`text-sm font-medium uppercase tracking-wider mr-2 ${textSecondaryColor}`}>
            {eyebrow} •{' '}
          </span>
        )}
        {title}
        {eyebrow && eyebrowPlacement === 'inline-after' && (
          <span className={`text-sm font-medium uppercase tracking-wider ml-2 ${textSecondaryColor}`}>
            {' '}• {eyebrow}
          </span>
        )}
      </h1>

      {description && (
        <p className={`text-lg mb-6 max-w-2xl mx-auto ${textSecondaryColor}`}>
          {description}
        </p>
      )}

      {highlights.length > 0 && (
        <div
          className={`flex flex-wrap justify-center gap-6 ${
            highlightPlacement === 'side' ? 'md:flex-row md:justify-start' : ''
          }`}
        >
          {highlights.map((highlight, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${textColor}`}>{highlight.value}</div>
              <div className={`text-sm ${textSecondaryColor}`}>{highlight.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



