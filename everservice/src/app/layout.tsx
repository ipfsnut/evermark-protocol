export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Everservice API</h1>
          <p>Backend service for Evermark Protocol</p>
          {children}
        </main>
      </body>
    </html>
  )
}