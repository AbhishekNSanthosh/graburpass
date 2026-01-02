import React from "react";
import Header from "../widgets/common/Header";
import Footer from "@/widgets/common/Footer";
import { Ticket, Calendar, Shield, Zap, Users, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      <Header />
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-blob mix-blend-multiply filter opacity-50" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply filter opacity-50" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply filter opacity-50" />
      </div>

      {/* Hero Section - Split Layout */}
      <section className="relative pt-32 pb-20  lg:pb-32 px-[5vw] overflow-visible">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10 relative">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start text-left lg:pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/> v2.0 is Live
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 text-foreground leading-[1.05] animate-fade-in-up">
              <span className="block text-gradient filter drop-shadow-sm">Your Events,</span>
              <span className="block text-gradient-primary">Reimagined.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted max-w-xl mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The all-in-one platform to sell tickets, manage attendees, and track revenue. 
              <span className="block mt-2 font-normal text-foreground">Beautifully simple. Powerfully effective.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-medium text-base transition-colors flex items-center gap-2">
                Start for Free <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 bg-transparent text-foreground hover:bg-black/5 rounded-full font-medium text-base transition-colors border border-black/10 dark:border-white/10">
                Book a Demo
              </button>
            </div>
            

          </div>

          {/* Right Column: Visuals */}
          <div className="relative h-[500px] lg:h-[600px] perspective-1000 w-full animate-fade-in-up hidden lg:block" style={{ animationDelay: '0.4s' }}>
             <div className="relative w-full h-full transform rotate-y-[-12deg] rotate-x-[6deg] scale-90 transition-transform duration-700 hover:rotate-y-[-5deg] hover:rotate-x-[2deg]">
                 
                 {/* Main Dashboard Card */}
                 <div className="absolute top-10 right-0 w-[90%] h-[500px] bg-white/80 dark:bg-[#111]/90 border border-white/50 dark:border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-black/5">
                    {/* Window Controls */}
                    <div className="h-14 px-6 border-b border-black/5 flex justify-between items-center bg-white/50 dark:bg-black/20 backdrop-blur-md">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/5"></div>
                          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/5"></div>
                          <div className="w-3 h-3 rounded-full bg-[#28C840] border border-black/5"></div>
                       </div>
                    </div>
                    
                    {/* Dashboard Content Mockup */}
                    <div className="p-6 grid grid-cols-1 gap-6 h-full bg-surface-1/30">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <h3 className="text-xl font-bold">Dashboard</h3>
                             <p className="text-muted text-xs">Overview</p>
                          </div>
                          <button className="px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-bold">Create +</button>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="h-32 rounded-2xl bg-white dark:bg-black/20 border border-black/5 p-4 flex flex-col justify-between relative overflow-hidden">
                             <div className="flex justify-between items-start">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><Ticket className="w-4 h-4"/></div>
                                <span className="text-[10px] font-bold text-green-500">+12%</span>
                             </div>
                             <div>
                                <div className="text-2xl font-bold">1,245</div>
                                <div className="text-xs text-muted">Sold</div>
                             </div>
                          </div>
                          <div className="h-32 rounded-2xl bg-white dark:bg-black/20 border border-black/5 p-4 flex flex-col justify-between relative overflow-hidden">
                             <div className="flex justify-between items-start">
                                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500"><BarChart3 className="w-4 h-4"/></div>
                                <span className="text-[10px] font-bold text-green-500">+24%</span>
                             </div>
                             <div>
                                <div className="text-2xl font-bold">₹8.5L</div>
                                <div className="text-xs text-muted">Rev</div>
                             </div>
                          </div>
                       </div>

                       <div className="h-40 rounded-2xl bg-white dark:bg-black/20 border border-black/5 w-full relative overflow-hidden flex flex-col p-4">
                          <div className="flex-1 w-full bg-gradient-to-t from-primary/5 to-transparent relative rounded-lg border-dashed border border-primary/10">
                              <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" preserveAspectRatio="none">
                                  <path d="M0 60 Q 20 40 40 50 T 80 20 T 120 40 T 160 10 T 200 30" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                              </svg>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Floating Premium Ticket */}
                 <div className="absolute top-[10%] left-[-5%] w-60 h-[24rem] bg-white dark:bg-[#151515] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transform -rotate-6 animate-float-slow z-30 flex flex-col overflow-hidden border border-white/20 ring-1 ring-black/5">
                    <div className="bg-[#111] text-white p-5 pb-8 relative overflow-hidden">
                       <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-primary/30 blur-3xl rounded-full"></div>
                       <div className="relative z-10 flex justify-between items-start">
                          <div className="text-[10px] font-mono opacity-60 tracking-widest">VIP</div>
                          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md"><Zap className="w-3 h-3"/></div>
                       </div>
                       <div className="relative z-10 mt-6">
                           <h3 className="text-2xl font-black leading-none">Design<br/>Conf<span className="text-primary">.</span></h3>
                           <p className="mt-1 text-xs opacity-60">SF, CA</p>
                       </div>
                    </div>
                    <div className="flex-1 bg-surface-1/50 p-5 flex flex-col justify-between relative">
                        <div className="absolute -top-3 left-0 w-full h-6 flex justify-between px-[-6px]">
                           <div className="w-6 h-6 rounded-full bg-[#111] -ml-3"></div>
                           <div className="w-full border-t-2 border-dashed border-gray-300 mx-2 mt-3"></div>
                           <div className="w-6 h-6 rounded-full bg-[#111] -mr-3"></div>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-muted">Date</span>
                               <span className="font-bold">Oct 24</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-muted">Seat</span>
                               <span className="font-bold">A-12</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full h-8 bg-black rounded-md flex items-center justify-center">
                                <span className="font-mono text-white text-[10px] tracking-[0.3em]">||| |||</span>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
          
           {/* Mobile Visual (Simplified) */}
           <div className="lg:hidden w-full relative h-[300px] mt-8">
               <div className="absolute inset-0 bg-white/80 dark:bg-[#111]/90 rounded-2xl border border-black/5 shadow-xl overflow-hidden">
                   {/* Simplified content for mobile */}
                   <div className="p-4 flex items-center justify-center h-full text-muted">
                       Interactive Dashboard Preview
                   </div>
               </div>
           </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-[5vw] bg-surface-1" id="features">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Everything you need, <span className="text-primary">Nothing you don't.</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
               Powerful tools designed to make your event management effortless and professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Features map */}
             <FeatureCard 
                icon={<Ticket className="w-6 h-6 text-primary" />}
                title="Smart Ticketing"
                desc="Generate unique QR-based tickets instantly. Validate securely at the door with our scanner app."
             />
             <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
                title="Real-time Analytics"
                desc="Track sales, revenue, and attendee demographics in real-time. Make data-driven decisions."
             />
             <FeatureCard 
                icon={<Shield className="w-6 h-6 text-green-500" />}
                title="Secure Payments"
                desc="Instant payouts with trusted payment gateways. Encrypted transactions for peace of mind."
             />
             <FeatureCard 
                icon={<Users className="w-6 h-6 text-purple-500" />}
                title="Attendee Management"
                desc="Manage guest lists, send bulk emails, and handle check-ins smoothly."
             />
             <FeatureCard 
                icon={<Zap className="w-6 h-6 text-yellow-500" />}
                title="Instant Setup"
                desc="Launch your event page in under 5 minutes. No coding required."
             />
             <FeatureCard 
                icon={<Calendar className="w-6 h-6 text-orange-500" />}
                title="Event Scheduling"
                desc="Detailed itineraries and multi-day schedules support for complex conferences."
             />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-[5vw] relative overflow-hidden" id="pricing">
         <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-30"></div>
         
         <div className="w-full text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Simple, transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-muted text-lg">
               No hidden fees. No credit card required to start.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border border-border bg-surface-1 hover:border-primary/20 transition-all duration-300">
               <h3 className="text-xl font-bold text-foreground mb-2">Free Events</h3>
               <div className="text-4xl font-bold text-foreground mb-6">₹100<span className="text-base font-normal text-muted">/event</span></div>
               <p className="text-muted text-sm mb-8">Ideal for small meetups requiring basic tools.</p>
               <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Up to 100 tickets</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Basic Analytics</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Email Support</li>
               </ul>
                <button className="w-full py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-surface-2 transition-colors">Contact Sales</button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl border-2 border-primary bg-background relative shadow-2xl scale-105 z-10">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>
               <h3 className="text-xl font-bold text-foreground mb-6 text-center">Paid Events</h3>
               
               <div className="bg-surface-2/50 rounded-2xl p-4 mb-8">
                 <div className="flex items-center justify-center gap-3">
                   <div className="text-center">
                     <div className="text-4xl font-bold text-foreground">2%</div>
                     <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Platform</div>
                   </div>
                   <div className="text-xl text-muted/50 font-light pb-4">+</div>
                   <div className="text-center">
                     <div className="text-4xl font-bold text-foreground">2%</div>
                     <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Gateway</div>
                   </div>
                 </div>
               </div>

               <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div>Unlimited tickets</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div>Advanced Analytics</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div>Priority Support</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div>Instant Payouts</li>
               </ul>
               <button className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-[0_0_20px_rgba(255,38,75,0.4)] transition-all">Get Started</button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl border border-border bg-surface-1 hover:border-primary/20 transition-all duration-300">
               <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
               <div className="text-4xl font-bold text-foreground mb-6">Custom</div>
               <p className="text-muted text-sm mb-8">For large-scale festivals and conferences.</p>
               <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Dedicated Manager</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>On-site Support</li>
                  <li className="flex items-center gap-3 text-sm text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>White-label Solution</li>
               </ul>
               <button className="w-full py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-surface-2 transition-colors">Contact Sales</button>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-black/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-3 bg-surface-1 rounded-xl group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-muted text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
