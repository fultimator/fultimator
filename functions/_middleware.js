export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Let static assets pass through (JS, CSS, images, etc.)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|xml|txt|webp|avif)$/)) {
    return next();
  }
  
  // Let API routes pass through if any
  if (url.pathname.startsWith('/api/')) {
    return next();
  }
  
  // For all other routes (React Router routes), try to serve the file first
  const response = await next();
  
  // If the file doesn't exist (404), serve index.html for client-side routing
  if (response.status === 404) {
    const indexResponse = await context.env.ASSETS.fetch(new URL('/index.html', url.origin));
    // Return index.html but preserve the original URL
    return new Response(indexResponse.body, {
      status: 200,
      headers: indexResponse.headers
    });
  }
  
  return response;
}