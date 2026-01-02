"use client";

import Footer from "@/widgets/common/Footer";
import Header from "@/widgets/common/Header";
import { Building2, Mail, MapPin, Phone, MessageSquare, ArrowRight } from "lucide-react";
import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      <Header />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-surface-1/50 -z-10 border-b border-black/5" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex-1 pt-32 pb-20 px-[5vw]">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* LEFT: Header & Content */}
            <div className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        <MessageSquare className="w-3 h-3" /> Contact Support
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none">
                        Let's start a <br />
                        <span className="text-gradient-primary">Conversation.</span>
                    </h1>
                    <p className="text-lg text-muted max-w-md leading-relaxed">
                        Have a question about GraburPass? We're here to help you with anything you need.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid gap-6">
                    <div className="p-6 bg-white dark:bg-[#111] border border-black/5 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Email Us</h3>
                                <p className="text-sm text-muted mb-2">For general support & inquiries</p>
                                <a href="mailto:beondinnovations@gmail.com" className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                                    beondinnovations@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-[#111] border border-black/5 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Call Us</h3>
                                <p className="text-sm text-muted mb-2">Mon-Fri from 9am to 6pm</p>
                                <a href="tel:+919946846101" className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                                    +91 9946846101
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Company Info & Legal */}
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                
                {/* Visual / Support Card */}
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gradient-to-br from-surface-2 to-surface-1 border border-black/5 shadow-2xl skew-y-1 flex items-center justify-center p-8">
                     <div className="text-center space-y-4 max-w-xs">
                         <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <MessageSquare className="w-8 h-8" />
                         </div>
                         <h3 className="text-2xl font-black text-foreground">We're here to help</h3>
                         <p className="text-muted text-sm leading-relaxed">
                             Our support team is just a click away to assist you with your events.
                         </p>
                     </div>
                     
                     {/* Decorative Glow */}
                     <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                </div>

                {/* Company Details */}
                <div className="p-8 bg-surface-1/50 rounded-3xl border border-black/5 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <Building2 className="w-5 h-5 text-muted" />
                             <h3 className="text-sm font-bold uppercase text-muted tracking-wider">Legal Entity</h3>
                        </div>
                        <p className="text-xl font-bold text-foreground">Beond Innovations</p>
                        <p className="text-sm text-muted">A digital ticketing and event management platform</p>
                    </div>
                    
                    <div className="w-full h-px bg-black/5" />
                    
                    <div>
                        <p className="text-xs font-semibold text-muted mb-1">Registration</p>
                        <p className="font-mono text-sm text-foreground bg-white border px-2 py-1 rounded-md w-fit">
                            UDYAM-KL-01-0060286
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
