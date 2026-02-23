import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";



const PUBLIC_ROUTES = ["/", "/login", "/landing"];


const ROLE_ROUTES: Record<string, string[]> = {
  admin: ["/admin", "/patient"],
  profissional: ["/patient"],
  academico: ["/patient"],
  supervisor: ["/patient"],
  paciente: ["/paciente"],
  responsavel: ["/paciente"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((r) => pathname === r)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role) {
    const allowed = ROLE_ROUTES[role] ?? [];
    const hasAccess = allowed.some((r) => pathname.startsWith(r));
    if (!hasAccess) {
      const defaultRoute = allowed[0] ?? "/login";
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|api).*)"],
};