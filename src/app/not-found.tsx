import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="h-display text-8xl text-accent">404</p>
      <h1 className="h-display mt-2 text-4xl">Spike introuvable</h1>
      <p className="mt-3 text-muted">Cette page n&apos;existe pas ou a été désamorcée.</p>
      <Link href="/" className="btn-primary mt-6">Retour à l&apos;accueil</Link>
    </section>
  );
}
