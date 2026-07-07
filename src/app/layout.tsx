import type { Metadata } from "next";
import { Darker_Grotesque, Fira_Code } from "next/font/google";
import "./globals.css";

// Configuración exacta de las tipografías de la UI
const darkerGrotesque = Darker_Grotesque({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '900'], 
  variable: '--font-darker' 
});

const firaCode = Fira_Code({ 
  subsets: ['latin'], 
  weight: ['400', '700'], 
  variable: '--font-fira' 
});

// Configuración SEO Avanzada y Metadatos
export const metadata: Metadata = {
  title: {
    default: "Baloto Analytics | Análisis Estadístico y Predictivo",
    template: "%s | Baloto Analytics"
  },
  description: "Plataforma avanzada de análisis estadístico y predicciones probabilísticas para Baloto y Revancha en Colombia. Optimiza tus jugadas con datos en tiempo real.",
  keywords: ["Baloto", "Revancha", "Analítica Baloto", "Predicciones Baloto", "Lotería Colombia", "Estadísticas de sorteos", "Balotas más activas"],
  authors: [{ name: "Brayan Albadam", url: "https://brayanalbadam.com" }],
  creator: "Brayan Albadam",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://analitica-baloto.onrender.com",
    title: "Baloto Analytics | Análisis Estadístico y Predictivo",
    description: "Analiza tendencias históricas, controla sorteos y genera combinaciones inteligentes basadas en distribución probabilística para Baloto y Revancha.",
    siteName: "Baloto Analytics",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${darkerGrotesque.variable} ${firaCode.variable} h-full antialiased text-[#E4E4E7] bg-[#09090B]`}
      suppressHydrationWarning 
    >
      <body 
        className="min-h-full flex flex-col font-sans selection:bg-[#9EFF00] selection:text-black"
        suppressHydrationWarning 
      >
        {children}
      </body>
    </html>
  );
}