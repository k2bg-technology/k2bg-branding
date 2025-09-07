export async function GET() {
  const adsContent = `google.com, pub-4041000761552697, DIRECT, f08c47fec0942fa0`;

  return new Response(adsContent, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
