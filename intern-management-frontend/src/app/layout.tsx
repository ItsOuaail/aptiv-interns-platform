import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children} {/* This renders the page content */}
        </AuthProvider>
      </body>
    </html>
  );
}