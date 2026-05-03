export const metadata = { title: 'ELIMFILTERS | Asset Protection Systems', description: 'Industrial filtration engineering.' };
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=Barlow:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap' rel='stylesheet' />
      </head>
      <body>{children}</body>
    </html>
  );
}