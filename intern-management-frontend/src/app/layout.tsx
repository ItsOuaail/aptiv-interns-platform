import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <body className="bg-red-500">{children}</body> {/* This renders the page content */}
        </AuthProvider>
      </body>
    </html>
  );
}