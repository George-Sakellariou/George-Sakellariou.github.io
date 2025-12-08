'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const architectures = [
    {
      number: '01',
      title: 'Enterprise RAG System',
      description: 'Intelligent document retrieval with semantic search, hybrid ranking, and optimized caching strategies for production-scale deployments.',
      tags: ['Azure OpenAI', 'Vector DB', 'Redis', 'FastAPI'],
      status: 'In Development'
    },
    {
      number: '02',
      title: 'Talk-to-Data Platform',
      description: 'Natural language interface for database queries with intelligent SQL generation, security controls, and automated visualization.',
      tags: ['GPT-5', 'Azure SQL', 'LangChain', 'Power BI'],
      status: 'In Development'
    },
    {
      number: '03',
      title: 'AI Insights Dashboard',
      description: 'Multi-model orchestration system with intelligent routing, automated analytics, and real-time insight generation.',
      tags: ['Multi-Model', 'Azure Synapse', 'React', 'Data Pipeline'],
      status: 'In Development'
    }
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 backdrop-blur-sm bg-black/20 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="text-sm font-mono tracking-wider"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-white/40">GS</span>
            </motion.div>
            
            <div className="flex items-center gap-8 text-sm">
              <a href="#work" className="text-white/60 hover:text-white transition-colors">Work</a>
              <a href="#contact" className="text-white/60 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 lg:px-12">
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Name */}
            <div className="space-y-4">
              <h1 className="text-7xl lg:text-8xl font-light tracking-tight">
                Georgios
                <br />
                <span className="gradient-text">Sakellariou</span>
              </h1>
            </div>

            {/* Title & Description */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-6 max-w-2xl"
            >
              <p className="text-2xl text-white/90 font-light">
                AI Solutions Architect
              </p>
              <p className="text-lg text-white/50 leading-relaxed font-light">
                Designing intelligent systems that bridge cutting-edge AI capabilities 
                with production-ready infrastructure. Specialized in Azure cloud architectures, 
                LLM orchestration, and scalable ML pipelines.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex gap-4 pt-4"
            >
              <a 
                href="#work"
                className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-all"
              >
                View Work
              </a>
              <a 
                href="#contact"
                className="px-8 py-3 border border-white/20 rounded-full hover:border-white/40 transition-all"
              >
                Get in Touch
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="work" className="min-h-screen py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-light mb-6">
              Reference <span className="gradient-text">Architectures</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl font-light">
              Production-grade system designs demonstrating expertise in AI infrastructure, 
              scalability, and intelligent automation.
            </p>
          </motion.div>

          <div className="space-y-8">
            {architectures.map((arch, index) => (
              <motion.article
                key={arch.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: 8 }}
                className="group cursor-pointer"
              >
                <a 
                  href={`/architecture-${arch.number.toLowerCase()}`}
                  className="block p-8 lg:p-12 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Number */}
                    <div className="text-7xl font-mono font-light text-white/10 group-hover:text-white/20 transition-colors">
                      {arch.number}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h3 className="text-3xl font-light group-hover:text-white/90 transition-colors">
                            {arch.title}
                          </h3>
                          <span className="px-3 py-1 text-xs font-mono text-white/40 border border-white/10 rounded-full">
                            {arch.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-lg leading-relaxed font-light">
                          {arch.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {arch.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-4 py-2 text-sm font-mono text-white/70 bg-white/[0.03] border border-white/10 rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-white/30 group-hover:text-white/60 group-hover:translate-x-2 transition-all">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-6 lg:px-12 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl w-full"
        >
          <div className="space-y-12">
            <div>
              <h2 className="text-5xl lg:text-6xl font-light mb-6">
                Let's <span className="gradient-text">Connect</span>
              </h2>
              <p className="text-xl text-white/50 max-w-2xl font-light">
                Open to discussing AI architecture projects, technical collaborations, 
                and opportunities to build intelligent systems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Email */}
              <motion.a
                href="mailto:gsakel25@gmail.com"
                whileHover={{ y: -4 }}
                className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
              >
                <div className="space-y-3">
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-white/40 mb-1 font-mono">Email</div>
                    <div className="text-white/90 font-light">gsakel25@gmail.com</div>
                  </div>
                </div>
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                href="https://www.linkedin.com/in/george-sakellariou-23m11n13"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
              >
                <div className="space-y-3">
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-white/40 mb-1 font-mono">LinkedIn</div>
                    <div className="text-white/90 font-light">george-sakellariou</div>
                  </div>
                </div>
              </motion.a>

              {/* GitHub */}
              <motion.a
                href="https://github.com/George-Sakellariou"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
              >
                <div className="space-y-3">
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-white/40 mb-1 font-mono">GitHub</div>
                    <div className="text-white/90 font-light">George-Sakellariou</div>
                  </div>
                </div>
              </motion.a>
            </div>

            {/* Location */}
            <div className="text-center pt-8">
              <p className="text-white/40 font-light">
                📍 Based in Volos, Greece • Available for remote collaborations
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p className="font-mono">© 2024 Georgios Sakellariou</p>
          <p className="font-light">Designing the future of intelligent systems</p>
        </div>
      </footer>
    </main>
  )
}