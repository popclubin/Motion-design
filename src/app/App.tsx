import { RouterProvider } from 'react-router/dom';
import { ToastHost } from '../components/ui/ToastHost';
import { router } from './router';
import { Providers } from './providers';

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ToastHost />
    </Providers>
  );
}
