import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight, Heart, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-black/5 z-10 relative overflow-hidden">
      
      <div className="w-full px-[5vw] py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12  mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 space-y-8 pr-12">
             <div>
                <Link href="/" className="relative h-10 w-40 block transition-opacity hover:opacity-80 mb-6">
                   <Image 
                     src="/mainlogo.svg" 
                     alt="Graburpass" 
                     fill
                     className="object-contain object-left"
                   />
                </Link>
                <p className="text-muted text-sm leading-relaxed max-w-sm">
                   We're building the future of event ticketing. Beautiful, powerful, and simpler than ever before.
                </p>
                <p className="text-[10px] text-muted/60 font-medium tracking-widest uppercase mt-4">
                   A product from Beond Innovations
                </p>
             </div>
             
             <div className="flex gap-4">
               <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} />
               <SocialLink href="#" icon={<Instagram className="w-4 h-4" />} />
               <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} />
               <SocialLink href="mailto:hello@graburpass.com" icon={<Mail className="w-4 h-4" />} />
             </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
             <FooterColumn 
                title="Product" 
                links={[
                  { label: "Features", href: "/#features" },
                  { label: "Pricing", href: "/#pricing" },
                  { label: "Changelog", href: "/changelog" },
                  { label: "Docs", href: "/docs" },
                ]}
             />
             <FooterColumn 
                title="Company" 
                links={[
                  { label: "About", href: "/about" },
                  { label: "Careers", href: "/careers" },
                  { label: "Blog", href: "/blog" },
                  { label: "Contact", href: "/contact" },
                ]}
             />
             <FooterColumn 
                title="Resources" 
                links={[
                   { label: "Community", href: "/community" },
                   { label: "Help Center", href: "/help" },
                   { label: "Partners", href: "/partners" },
                   { label: "Media Kit", href: "/media-kit" },
                ]}
             />
             <FooterColumn 
                title="Legal" 
                links={[
                   { label: "Privacy", href: "/privacy-policy" },
                   { label: "Terms", href: "/terms-and-conditions" },
                   { label: "Refunds", href: "/refund-policy" },
                   { label: "Cookies", href: "/cookie-policy" },
                ]}
             />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-sm text-muted/60">
              <p>© 2026 Beond Innovations. All rights reserved.</p>
           </div>
           
           <div className="flex items-center gap-2 text-sm text-muted/60">
               <Zap className="w-3.5 h-3.5 text-primary" />
               <span>Powered by Beond Innovations</span>
           </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string, links: {label: string, href: string}[] }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-6 text-sm uppercase tracking-wider opacity-80">{title}</h4>
      <ul className="space-y-3">
        {links.map((link, i) => (
          <li key={i}>
            <Link href={link.href} className="text-muted hover:text-primary transition-colors text-sm font-medium">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <a href={href} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-black/5 flex items-center justify-center text-muted hover:border-primary/50 hover:text-primary transition-all">
      {icon}
    </a>
  );
}
