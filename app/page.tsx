import FixtureCarousel from './components/FixtureCarousel';
import HomeContent from './components/HomeContent';

export const revalidate = 60;

export default function HomePage() {
  return (
    <div>
      <FixtureCarousel />
      <HomeContent />
    </div>
  );
}
