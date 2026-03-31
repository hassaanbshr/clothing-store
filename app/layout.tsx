import type { Metadata } from "next";
import { Inter, Poppins, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { NewsletterPopup } from "@/components/home/newsletter-popup";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.category
    .findMany({ select: { id: true, name: true, slug: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('clothing-store-ui');if(t){try{var s=JSON.parse(t);if(s.state&&s.state.theme)document.documentElement.classList.add(s.state.theme);}catch(e){}}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${brand.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar categories={categories} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CartDrawer />
            <QuickViewModal />
            <NewsletterPopup />
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
