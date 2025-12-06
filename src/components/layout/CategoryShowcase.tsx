import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';

// Mock categories - replace with actual data fetching
const categories = [
  {
    name: 'Brackets',
    description: 'Structural brackets and supports',
    icon: '🔧',
  },
  {
    name: 'Beams',
    description: 'Load-bearing beams and supports',
    icon: '📐',
  },
  {
    name: 'Gears',
    description: 'Precision gears and assemblies',
    icon: '⚙️',
  },
  {
    name: 'Shafts',
    description: 'Rotating shafts and axles',
    icon: '🔩',
  },
];

export default function CategoryShowcase() {
  return (
    <section className="relative overflow-hidden text-white py-20" style={{ background: 'var(--hero-blue-gradient)' }}>
      <TechnicalPattern />
      <div className="absolute inset-0 bg-black/30" />
      <BlueprintSketchLayer />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Product Categories</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Browse our comprehensive catalog of industrial components.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="catalog-glass-container rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer text-white"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
              <p className="text-sm text-white/90">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



