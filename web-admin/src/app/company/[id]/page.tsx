import { redirect } from "next/navigation";

export default async function CompanyInitPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params;
  // Redirigir el resumen general directo a la administracion de productos
  redirect(`/company/${unwrappedParams.id}/products`);
}
