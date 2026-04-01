import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiSalud — Osteopatía y Masajes en Madrid',
  description: 'Osteopatía, masajes y terapias de bienestar en Madrid. Servicio en centros y a domicilio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
