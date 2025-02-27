import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Sobre',
      links: [
        { label: 'Nossa História', href: '/about' },
        { label: 'Como Funciona', href: '/how-it-works' },
        { label: 'Carreiras', href: '/careers' },
        { label: 'Imprensa', href: '/press' },
      ],
    },
    {
      title: 'Suporte',
      links: [
        { label: 'Central de Ajuda', href: '/help' },
        { label: 'Contato', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Segurança', href: '/safety' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Termos de Uso', href: '/terms' },
        { label: 'Privacidade', href: '/privacy' },
        { label: 'Cookies', href: '/cookies' },
        { label: 'Licenças', href: '/licenses' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/costaverde', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/costaverde', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/costaverde', label: 'Twitter' },
  ]

  return (
    <footer className="bg-brand-primary text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
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
            <p className="text-sm">
              A maior plataforma de locação de embarcações do Brasil.
              Navegue com segurança e conforto pelos melhores destinos.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Costa Verde Barcos. Todos os direitos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-400">
                Atendimento: +55 (24) 99999-9999 | contato@costaverde.com.br
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 