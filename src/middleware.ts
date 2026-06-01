import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos todas las rutas bajo /admin.
// Si el usuario no está autenticado, Clerk lo redirigirá automáticamente a su página de inicio de sesión segura.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Excluir archivos estáticos internos de Next.js, iconos, service workers y el manifiesto PWA
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico|manifest.json|icon.png|sw.js|therapist.png).*)',
    // Ejecutar siempre para rutas de API y trpc
    '/(api|trpc)(.*)',
  ],
};
