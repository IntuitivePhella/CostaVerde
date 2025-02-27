"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Anchor, Shield, Star, Users, Wallet, Clock, CheckCircle, Ship } from 'lucide-react'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'Embarcações', href: '/boats' },
    { label: 'Anuncie seu Barco', href: '/register-boat' },
    { label: 'Como Funciona', href: '/how-it-works' },
    { label: 'Contato', href: '/contact' },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Todas as embarcações são verificadas e seguradas. Sua segurança é nossa prioridade.',
    },
    {
      icon: Users,
      title: 'Proprietários Verificados',
      description: 'Trabalhamos apenas com proprietários e operadores profissionais e certificados.',
    },
    {
      icon: Star,
      title: 'Avaliações Reais',
      description: 'Sistema de avaliação transparente para garantir a melhor experiência.',
    },
    {
      icon: Clock,
      title: 'Suporte 24/7',
      description: 'Nossa equipe está sempre disponível para ajudar em qualquer situação.',
    },
  ]

  const ownerBenefits = [
    {
      icon: Wallet,
      title: 'Renda Extra',
      description: 'Transforme seu barco em uma fonte de renda adicional e cubra seus custos de manutenção.',
    },
    {
      icon: CheckCircle,
      title: 'Cadastro Gratuito',
      description: 'Inscrição 100% gratuita e processo de cadastro simplificado em menos de 15 minutos.',
    },
    {
      icon: Ship,
      title: 'Controle Total',
      description: 'Defina seus preços, disponibilidade e regras de uso com total autonomia.',
    },
    {
      icon: Shield,
      title: 'Pagamento Seguro',
      description: 'Receba os pagamentos diretamente em sua conta com total segurança.',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/hero-bg.jpg"
            alt="Barco navegando ao pôr do sol"
            fill
            className="object-cover w-full h-full"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        </div>

        {/* Navigation Area */}
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 pt-4">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <div className="relative h-16 w-56">
                  <Image
                    src="/images/logo.png"
                    alt="Costa Verde Barcos"
                    fill
                    className="object-contain brightness-0 invert"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-white hover:text-white/80 transition-colors text-lg font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button className="bg-white text-brand-primary hover:bg-white/90" asChild>
                  <Link href="/register">Cadastrar</Link>
                </Button>
              </div>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-4">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="pt-4 flex flex-col space-y-4">
                      <Button variant="ghost" asChild>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Entrar
                        </Link>
                      </Button>
                      <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white" asChild>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          Cadastrar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Navegue pelos Melhores Destinos do Brasil
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Alugue barcos, lanchas e iates com segurança e conforto.
              Experiências únicas para momentos inesquecíveis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white" asChild>
                <Link href="/boats">
                  Encontrar Embarcação
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10" asChild>
                <Link href="/how-it-works">
                  Como Funciona
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher a Costa Verde?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Oferecemos a melhor experiência em locação de embarcações,
              com segurança, transparência e suporte completo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="py-24 bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Torne seu Barco uma Oportunidade de Negócio
            </h2>
            <p className="text-xl max-w-2xl mx-auto">
              Transforme seu barco em uma fonte de renda extra, anunciando para locação com a Costa Verde. 
              Pague as despesas e lucre!
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" className="bg-white text-brand-primary hover:bg-white/90" asChild>
                <Link href="/register-boat">
                  Quero Anunciar
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ownerBenefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="inline-flex p-3 bg-white/10 rounded-full mb-4">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-200">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Procurando uma Embarcação?
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                Encontre o barco ideal para seu passeio. Temos diversas opções de embarcações verificadas e seguras.
              </p>
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white" asChild>
                <Link href="/boats">
                  Encontrar Embarcação
                </Link>
              </Button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tem um Barco?
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                Anuncie seu barco e comece a lucrar. Processo simples, rápido e sem custos iniciais.
              </p>
              <Button size="lg" variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white" asChild>
                <Link href="/register-boat">
                  Anunciar Agora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
