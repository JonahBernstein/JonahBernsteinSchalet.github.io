'use client';

import React, { useState } from 'react';
import { Menu, X, LinkedinIcon, MailIcon } from 'lucide-react';

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
      description: 'Leading research and development of enhanced rock weathering techniques for carbon dioxide removal, focusing on optimizing mineral selection, application methods, and monitoring protocols.',
      tags: ['Carbon Removal', 'ERW', 'Climate Solutions'],
    },
    {
      title: 'Geology-Biology Research at Brown',
      description: 'Conducted interdisciplinary research combining geological and biological approaches to understand earth systems and environmental processes.',
      tags: ['Academia', 'Research', 'Earth Sciences'],
    },
    {
      title: 'Climate Solutions Implementation',
      description: 'Working on practical applications of enhanced rock weathering in agricultural settings to promote both carbon capture and soil health.',
      tags: ['Climate Change', 'Agriculture', 'Sustainability'],
    },
  ];

  const skills = [
    'Geochemical Analysis', 'Enhanced Rock Weathering', 'Field Research',
    'Data Analysis', 'Geographic Information Systems', 'Geological Sampling',
    'Inorganic and Organic Geochemical Laboratory Work', 'Scientific Writing'
  ];

  return (
    <div className="min-h-screen bg-[#FFFECB]">
      {/* Navigation */}
      <nav className="bg-[#281F08] shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#FFFECB]">Jonah Bernstein-Schalet</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[#FBEC9A] hover:text-[#FFFECB] px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#FBEC9A] hover:text-[#FFFECB]"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-[#FBEC9A] hover:text-[#FFFECB] hover:bg-[#3B2513]"
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
        <section id="home" className="min-h-screen flex items-center justify-center relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/Fire.JPEG" 
              alt="Post-fire forest landscape" 
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#281F08]/70 via-[#281F08]/50 to-[#281F08]/70"></div>
          </div>
          
          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-[#FFFECB] mb-4">
              Jonah Bernstein-Schalet
            </h1>
            <p className="text-xl md:text-2xl text-[#FEF6B3] mb-8">
              Research Scientist at Mati Carbon | Geochemist | Enhanced Rock Weathering Specialist
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#contact" className="bg-[#E27B4F] text-[#FFFECB] px-6 py-3 rounded-lg hover:bg-[#C9514A] transition duration-300">
                Get in Touch
              </a>
              <a href="#projects" className="bg-[#FBEC9A] text-[#281F08] px-6 py-3 rounded-lg hover:bg-[#F8E180] transition duration-300">
                View My Work
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-[#281F08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#FFFECB]">About Me</h2>
            <div className="max-w-3xl mx-auto text-[#FEF6B3]">
              <p className="mb-4">
                I'm a Research Scientist at Mati Carbon, where I help with research, MRV development across the global south, and analytical geochemistry
                for carbon dioxide removal. With a Bachelors degree in Geology-Biology from Brown University, I combine my expertise 
                in earth sciences and my experience in inorganic and organic geochemical laboratories to help implement and develop practical solutions to the challenges of enhanced rock weathering.
              </p>
              <p>
                As part of the science team, my current roles include analytical data quality control, MRV development for CDR calculations, consulting on active research projects, 
                and interfacing with certifiers regarding the scientific aspects of our operation. As a part of the Enhanced Rock Weathering industry, my goal is to bring accountability, integrity, 
                and an unwavering commitment to the geochemical principles I have been educated on.
              </p>
            </div>
          </div>
        </section>

        {/* Field Work Gallery */}
        <section id="fieldwork" className="py-20 bg-[#3B2513]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#FFFECB]">Field Research</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img src="/images/CrookedRiver.JPEG" alt="Crooked River Canyon" className="w-full h-64 object-cover"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                  <p className="text-[#FFFECB] text-sm">Field research in Oregons Crooked River Canyon</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img src="/images/DischargeMeter.JPEG" alt="Stream discharge measurement" className="w-full h-64 object-cover"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                  <p className="text-[#FFFECB] text-sm">Stream discharge measurement in Oregons waterways</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img src="/images/Fire.JPEG" alt="Post-fire forest study" className="w-full h-64 object-cover"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                  <p className="text-[#FFFECB] text-sm">Investigating post-fire impacts in Oregon forests</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img src="/images/WaterSampling.JPEG" alt="Water sampling" className="w-full h-64 object-cover"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                  <p className="text-[#FFFECB] text-sm">Water sampling for geochemical analysis</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img src="/images/Seoni_Farmers.JPG" alt="Seoni Farmers" className="w-full h-64 object-cover"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                  <p className="text-[#FFFECB] text-sm">ERW Deployments on Rice Paddies in Madhya Pradesh</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img src="/images/BearLake.JPG" alt="Bear Lake research" className="w-full h-64 object-cover"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
                  <p className="text-[#FFFECB] text-sm">Research team at Bear Lake, Utah</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="py-20 bg-[#462818]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#FFFECB]">My Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <div key={index} className="bg-[#281F08] rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#FFFECB]">{project.title}</h3>
                    <p className="text-[#FEF6B3] mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-[#3B2513] text-[#FBEC9A] rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20 bg-[#3B2513]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#FFFECB]">Technical Skills</h2>
            
            {/* Skills Tags */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-[#281F08] rounded-lg text-[#FBEC9A] font-medium"
                >
                  {skill}
                </div>
              ))}
            </div>

            {/* Technical Examples Grid */}
            <h3 className="text-2xl font-bold text-center mb-8 text-[#FFFECB]">Analysis Examples</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* GIS Analysis */}
              <div className="bg-[#281F08] rounded-lg p-6 shadow-lg">
                <img src="/images/watersheds.png" alt="Multi-parameter Watershed Analysis" className="w-full rounded-lg mb-4"/>
                <h3 className="text-xl font-semibold mb-2 text-[#FFFECB]">GIS & Remote Sensing</h3>
                <p className="text-[#FEF6B3] mb-4">Complex watershed analysis integrating multiple spatial parameters including burn severity, land cover, and topography.</p>
              </div>

              {/* Soil Chemistry */}
              <div className="bg-[#281F08] rounded-lg p-6 shadow-lg">
                <img src="/images/soil-profiles.png" alt="Soil Profiles Analysis" className="w-full rounded-lg mb-4"/>
                <h3 className="text-xl font-semibold mb-2 text-[#FFFECB]">Geochemical Analysis</h3>
                <p className="text-[#FEF6B3] mb-4">Detailed characterization of soil chemistry through depth profiles, showing extractable element concentrations.</p>
              </div>

              {/* 3D Visualization */}
              <div className="bg-[#281F08] rounded-lg p-6 shadow-lg">
                <img src="/images/fires-3D.png" alt="3D Terrain Modeling" className="w-full rounded-lg mb-4"/>
                <h3 className="text-xl font-semibold mb-2 text-[#FFFECB]">3D Terrain Modeling</h3>
                <p className="text-[#FEF6B3] mb-4">Digital elevation model processing and 3D visualization for field site characterization and sampling design.</p>
              </div>

              {/* Global Analysis */}
              <div className="bg-[#281F08] rounded-lg p-6 shadow-lg">
                <img src="/images/basalt-map2.png" alt="Global Resource Analysis" className="w-full rounded-lg mb-4"/>
                <h3 className="text-xl font-semibold mb-2 text-[#FFFECB]">Global Resource Analysis</h3>
                <p className="text-[#FEF6B3] mb-4">Large-scale spatial analysis combining agricultural land use data with geological resources for ERW implementation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-[#281F08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#FFFECB]">Get in Touch</h2>
            <div className="flex justify-center space-x-8">
              <a href="https://linkedin.com/in/jbsgeo" className="text-[#FBEC9A] hover:text-[#FFFECB] transition-colors">
                <LinkedinIcon size={24} />
              </a>
              <a href="mailto:jonah.b@mati.earth" className="text-[#FBEC9A] hover:text-[#FFFECB] transition-colors">
                <MailIcon size={24} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#191900] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#FBEC9A]">
          <p>© {new Date().getFullYear()} Jonah Bernstein-Schalet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}