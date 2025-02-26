import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-20 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl text-brand-navy dark:text-brand-blue">
          Costa Verde Barcos
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Alugue barcos no litoral brasileiro de forma fácil e segura. Encontre a embarcação perfeita para sua aventura marítima.
        </p>
        <div className="space-x-4">
          <Link
            href="/boats"
            className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 dark:bg-brand-blue dark:hover:bg-brand-blue/90 dark:focus:ring-brand-blue"
          >
            Encontrar Barcos
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border border-brand-navy px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 dark:border-brand-blue dark:text-brand-blue dark:hover:bg-brand-blue/10 dark:focus:ring-brand-blue"
          >
            Anunciar meu Barco
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
            <h3 className="mb-4 text-xl font-bold">Encontre o Barco Ideal</h3>
            <p className="text-muted-foreground">
              Busque entre diversas opções de embarcações disponíveis para aluguel em toda a costa brasileira.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
            <h3 className="mb-4 text-xl font-bold">Reserve com Segurança</h3>
            <p className="text-muted-foreground">
              Processo de reserva simples e seguro, com pagamento protegido e suporte 24/7.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
            <h3 className="mb-4 text-xl font-bold">Aproveite sua Viagem</h3>
            <p className="text-muted-foreground">
              Desfrute de momentos únicos no mar com a tranquilidade de ter todo o suporte necessário.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-brand-navy dark:text-brand-blue">
              Por que escolher a Costa Verde Barcos?
            </h2>
            <p className="text-muted-foreground">
              Somos a maior plataforma de aluguel de barcos do Brasil, conectando proprietários e navegadores de forma segura e eficiente.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ Mais de 1.000 embarcações cadastradas</li>
              <li>✓ Presença em todo o litoral brasileiro</li>
              <li>✓ Avaliações verificadas</li>
              <li>✓ Suporte especializado</li>
            </ul>
          </div>
          <div className="flex-1">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.jpg"
                alt="Barco navegando"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
