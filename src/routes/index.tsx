import { createFileRoute } from '@tanstack/react-router';
import SceneLayout from '@/components/SceneLayout';

export const Route = createFileRoute('/')({
  component: Index,
  head: () => ({
    meta: [
      { title: 'Character Customization' },
      { name: 'description', content: 'Animated 3D mannequin character customization experience.' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap',
      },
    ],
  }),
});

function Index() {
  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ backgroundColor: '#C0B5C4' }}>
      <h1 className="sr-only">3D Character Customization</h1>
      <SceneLayout />
    </main>
  );
}
