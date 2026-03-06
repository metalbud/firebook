import "./globals.css";
import "./styles.css";
import { geistSans, geistMono } from "../lib/fonts";
import { AuthProvider } from "../contexts/AuthContext";
import { DarkModeProvider } from "../contexts/DarkModeContext";
import { UserProvider } from "../contexts/UserContext";
import Header from "../components/Header";

export const metadata = {
  title: "Firebook – Ignite your menu",
  description: "AI-powered recipe discovery and generation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <UserProvider>
            <DarkModeProvider>
              <Header />
              <div className="page-wrapper">{children}</div>
            </DarkModeProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
