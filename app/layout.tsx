// The site itself is static: public/index.html with its css/, js/, data/ and img/.
// Next.js only exists here to run the GitHub Pages export workflow.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
