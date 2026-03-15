import type { Metadata } from "next";
import { Inter, Playfair_Display, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickViewModal } from "@/components/product/quick-view-modal";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const brand = Roboto_Condensed({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "MARGELLE — Modern Minimalist Fashion",
  description: "Premium clothing and accessories. Shop the latest collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('clothing-store-ui');if(t){try{var s=JSON.parse(t);if(s.state&&s.state.theme)document.documentElement.classList.add(s.state.theme);}catch(e){}}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${brand.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CartDrawer />
            <QuickViewModal />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
