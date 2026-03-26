'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, X, Linkedin, Mail, ChevronDown } from 'lucide-react';

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Field Work', href: '#fieldwork' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ];

  const projects = [
    {
      title: 'Enhanced Rock Weathering at Mati Carbon',
      description:
        'Assisting with research and development of novel approaches to MRV, optimizing analytical methodologies, consulting on feedstock quality and suitability.',
      tags: ['Carbon Removal', 'ERW', 'Climate Solutions'],
    },
    {
      title: 'Biogeochemistry Research at Brown',
      description:
        'With the Ibarra Terrestrial Biogeochemistry group at Brown, I was involved in projects focused on the geological carbon cycle with respect to rock weathering, carbon export at the catchment scale, and hydrological systems.',
      tags: ['Academia', 'Research', 'Earth Sciences'],
    },
    {
      title: 'Senior Thesis: Post-fire Geochemistry in Oregon',
      description:
        'A coupled geospatial and geochemical analysis of soil and water conditions in post-fire landscapes in Oregon. Presented findings at 2 conferences.',
      tags: ['Wildfire', 'Soil Carbon', 'Rock Weathering'],
    },
  ];

  const skills = [
    'Geochemical Analysis',
    'Enhanced Rock Weathering',
    'Field Research',
    'Data Analysis',
    'Geographic Information Systems',
    'Geological Sampling',
    'Inorganic & Organic Geochemistry',
    'Scientific Writing',
  ];

  const fieldwork = [
    {
      src: '/images/CrookedRiver.JPEG',
      alt: 'Crooked River Canyon field research',
      caption: "Field research in Oregon's Crooked River Canyon",
    },
    {
      src: '/images/DischargeMeter.JPEG',
      alt: 'Stream discharge measurement',
      caption: "Stream discharge measurement in Oregon's waterways",
    },
    {
      src: '/images/Fire.JPEG',
      alt: 'Post-fire forest study site',
      caption: 'Investigating post-fire impacts in Oregon forests',
    },
    {
      src: '/images/WaterSampling.JPEG',
      alt: 'Water sampling for geochemical analysis',
      caption: 'Water sampling for geochemical analysis',
    },
    {
      src: '/images/Seoni_Farmers.jpg',
      alt: 'ERW deployment with farmers in Madhya Pradesh',
      caption: 'ERW deployments on rice paddies in Madhya Pradesh',
    },
    {
      src: '/images/BearLake.jpg',
      alt: 'Research team at Bear Lake, Utah',
      caption: 'Research team at Bear Lake, Utah',
    },
  ];

  const analysisExamples = [
    {
      src: '/images/watersheds.png',
      alt: 'Multi-parameter watershed GIS analysis',
      title: 'GIS & Remote Sensing',
      description:
        'Complex watershed analysis integrating multiple spatial parameters including burn severity, land cover, and topography.',
    },
    {
      src: '/images/soil-profiles.png',
      alt: 'Soil depth profile geochemistry',
      title: 'Geochemical Analysis',
      description:
        'Detailed characterization of soil chemistry through depth profiles, showing extractable element concentrations.',
    },
    {
      src: '/images/fires-3D.png',
      alt: '3D terrain model of fire study site',
      title: '3D Terrain Modeling',
      description:
        'Digital elevation model processing and 3D visualization for field site characterization and sampling design.',
    },
    {
      src: '/images/basalt-map2.png',
      alt: 'Global basalt resource analysis map',
      title: 'Global Resource Analysis',
      description:
        'Large-scale spatial analysis combining agricultural land use data with geological resources for ERW implementation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#1C1917]">
      {/* Navigation */}
      <nav className="bg-[#1C1917] fixed w-full z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-base font-semibold text-white tracking-wide">
                Jonah Bernstein-Schalet
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-stone-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-400 hover:text-white p-2 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-800">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section
          id="home"
          className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/Fire.JPEG"
              alt="Post-fire forest landscape in Oregon"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <p className="text-sm uppercase tracking-[0.25em] text-[#C2693A] font-medium mb-6">
              Geochemist
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 leading-tight">
              Jonah
              <br />
              Bernstein-Schalet
            </h1>
            <div className="w-16 h-0.5 bg-[#C2693A] mx-auto mt-6 mb-8" />
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Carbon Dioxide Removal 
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="#contact"
                className="bg-[#C2693A] text-white px-8 py-3 rounded text-sm font-semibold hover:bg-[#a8562e] transition-colors duration-200"
              >
                Get in Touch
              </a>
              <a
                href="#projects"
                className="border border-white/60 text-white px-8 py-3 rounded text-sm font-semibold hover:bg-white/10 transition-colors duration-200"
              >
                View My Work
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <a
            href="#about"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/50 hover:text-white transition-colors animate-bounce"
            aria-label="Scroll to about"
          >
            <ChevronDown size={28} />
          </a>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-widest text-[#C2693A] font-medium mb-3 text-center">
              Background
            </p>
            <h2 className="text-3xl font-bold text-center mb-10 text-[#1C1917]">
              About Me
            </h2>
            <div className="text-[#44403C] leading-8 space-y-5 text-[1.05rem]">
              <p>
                My passion is using earth's natural geochemical cycles to solve problems in human society. 
              </p>
              <p>
                Currently working as a research scientist at Mati Carbon PBC, leveraging sillicate rock dust for 
                the benefit of smallholder farmers.
              </p>
            </div>
          </div>
        </section>

        {/* Field Work Gallery */}
        <section id="fieldwork" className="py-24 bg-[#F7F4F0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-widest text-[#C2693A] font-medium mb-3 text-center">
              In the Field
            </p>
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1C1917]">
              Field Research
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fieldwork.map((item) => (
                <div
                  key={item.src}
                  className="group relative overflow-hidden rounded-lg shadow-sm aspect-[4/3] bg-stone-200"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm leading-snug">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-widest text-[#C2693A] font-medium mb-3 text-center">
              Work
            </p>
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1C1917]">
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-[#F7F4F0] rounded-lg p-6 border border-[#E8E3DC] flex flex-col"
                >
                  <h3 className="text-lg font-semibold mb-3 text-[#1C1917] leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-[#78716C] text-sm leading-relaxed flex-1 mb-5">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 border border-[#C2693A]/40 text-[#C2693A] rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 bg-[#F7F4F0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-widest text-[#C2693A] font-medium mb-3 text-center">
              Expertise
            </p>
            <h2 className="text-3xl font-bold text-center mb-10 text-[#1C1917]">
              Technical Skills
            </h2>

            <div className="flex flex-wrap justify-center gap-3 mb-20">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-5 py-2 bg-white border border-[#E8E3DC] rounded-full text-sm text-[#44403C] font-medium shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-center mb-8 text-[#1C1917]">
              Analysis Examples
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysisExamples.map((ex) => (
                <div
                  key={ex.src}
                  className="bg-white rounded-lg overflow-hidden border border-[#E8E3DC] shadow-sm"
                >
                  <div className="relative aspect-video bg-stone-100">
                    <Image
                      src={ex.src}
                      alt={ex.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="text-base font-semibold mb-2 text-[#1C1917]">
                      {ex.title}
                    </h4>
                    <p className="text-sm text-[#78716C] leading-relaxed">
                      {ex.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-[#1C1917]">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-widest text-[#C2693A] font-medium mb-3">
              Say Hello
            </p>
            <h2 className="text-3xl font-bold mb-4 text-white">Get in Touch</h2>
            <p className="text-stone-400 mb-10 leading-relaxed">
              Whether you&apos;re interested in discussing ERW science, carbon removal
              research, or potential collaborations, I&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://linkedin.com/in/jbsgeo"
                className="flex items-center justify-center gap-3 px-6 py-3 border border-stone-600 text-stone-300 hover:border-[#C2693A] hover:text-[#C2693A] rounded transition-colors duration-200 text-sm font-medium"
              >
                <Linkedin size={18} />
                linkedin.com/in/jbsgeo
              </a>
              <a
                href="mailto:jonah.b@mati.earth"
                className="flex items-center justify-center gap-3 px-6 py-3 border border-stone-600 text-stone-300 hover:border-[#C2693A] hover:text-[#C2693A] rounded transition-colors duration-200 text-sm font-medium"
              >
                <Mail size={18} />
                jonah.b@mati.earth
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#141210] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-stone-600 text-sm">
          <p>© {new Date().getFullYear()} Jonah Bernstein-Schalet</p>
        </div>
      </footer>
    </div>
  );
}
