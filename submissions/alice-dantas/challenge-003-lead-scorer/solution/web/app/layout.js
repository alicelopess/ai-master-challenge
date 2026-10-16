import "./globals.css";

export const metadata = {
  title: "Onde focar · Carteira aberta",
  description: "Carteira aberta por vendedor, com o motivo de cada posição.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
