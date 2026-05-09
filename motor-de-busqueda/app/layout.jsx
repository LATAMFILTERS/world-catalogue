export const metadata = { title: 'ELIMFILTERS | Asset Protection Systems', description: 'Industrial asset protection systems engineered for fleets, mining operations, and critical diesel and gasoline-powered infrastructure.' };
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=Russo+One&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap' rel='stylesheet' />
      </head>
      <body>{children}</body>
    </html>
  );
}