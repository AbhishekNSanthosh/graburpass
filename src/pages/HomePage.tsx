import React from 'react'
import Header from '../widgets/common/Header'
import Hero from '@/widgets/home/Hero'
import EffortlessManagement from '@/widgets/home/Landing'
import Footer from '@/widgets/common/Footer'

export default function HomePage() {
  return (
    <main>
        <Header/>
        <Hero/>
        <EffortlessManagement/>
        <Footer/>
    </main>
  )
}
