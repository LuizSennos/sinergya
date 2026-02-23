export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  admin: "/admin",
  profissional: "/patient",
  academico: "/patient",
  supervisor: "/patient",
  paciente: "/paciente",
  responsavel: "/paciente",
};

export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  admin: ["/admin", "/patient"],
  profissional: ["/patient"],
  academico: ["/patient"],
  supervisor: ["/patient"],
  paciente: ["/paciente"],
  responsavel: ["/paciente"],
};