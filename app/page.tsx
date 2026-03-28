'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const photos = [
  { src: '/images/CrookedRiver.JPEG', caption: 'Crooked River Canyon, Oregon' },
  { src: '/images/seoni_rice.jpg', caption: 'Madhya Pradesh, India' },
  { src: '/images/tnz_rice.jpg', caption: 'Tanzania' },
  { src: '/images/Fire.JPEG', caption: 'Oregon' },
  { src: '/images/kolhapur_flood_basalt.jpg', caption: 'Kolhapur, India' },
  { src: '/images/zambia_dirt.jpg', caption: 'Zambia' },
  { src: '/images/WaterSampling.JPEG', caption: 'Oregon' },
  { src: '/images/kolhapur_olivine.jpg', caption: 'Kolhapur, India' },
  { src: '/images/ethiopia_quarry.jpg', caption: 'Ethiopia' },
  { src: '/images/DischargeMeter.JPEG', caption: 'Oregon' },
  { src: '/images/soil_profile_birbhum.jpg', caption: 'Birbhum, India' },
  { src: '/images/kolhapur_saprolite.jpg', caption: 'Kolhapur, India' },
  { src: '/images/kolhapur_pinenut.jpg', caption: 'Kolhapur, India' },
  { src: '/images/gpm_geode.jpg', caption: '' },
];

const publications = [
  {
    title:
      'Constraining the Modern Hydrological Balance of Bear Lake, Utah-Idaho: Insights From Stable Isotopes (\u03b418O and \u03b42H)',
    authors: [
      'M. J. Custado',
      'C. A. Gagnon',
      'B. Belanger',
      'N. Sekhon',
      'J. Bernstein-Schalet',
      'C. W. Kinsley',
      'W. D. Sharp',
      'J. L. Oster',
      'D. E. Ibarra',
    ],
    year: '2025',
    doi: 'https://doi.org/10.1029/2024WR038264',
  },
  {
    title:
      'Limited Headwater CO\u2082 Emissions Relative to Downstream C Fluxes: Insights From a Tracer-Enabled Reactive Transport Model',
    authors: [
      'W. J. Larsen',
      'M. A. Torres',
      'E. J. Ramos',
      'S. Mu\u00f1oz',
      'Y. Hou',
      'T. Sun',
      'D. E. Ibarra',
      'M. Gammerman',
      'J. Bernstein-Schalet',
      'K. D. Suquino',
      'P. C. Kemeny',
    ],
    year: '2025',
    doi: 'https://doi.org/10.1029/2024JG008592',
  },
  {
    title:
      'Enhanced rock weathering for improved smallholder farmer welfare: An at-scale case study for rice agriculture in India',
    authors: [
      'J. S. Jordan',
      'T. M.D. Mills',
      'J. Bernstein-Schalet',
      'R. Dikshit',
      'A. Das',
      'D. Patidar',
      'R. M. Rajendran',
      'N. Kumar',
      'F. Alder',
      'M. T. Thorpe',
      'S. Agarwal',
      'L. Y. Yeung',
      'I. S. Sen',
      'N. Planavsky',
      'D. J. Beerling',
    ],
    year: '2026',
    doi: 'https://doi.org/10.70212/cdrxiv.2026483.v1',
  },
];

export default function Portfolio() {
  const [current, setCurrent] = useState(0);
  const currentRef = React.useRef(0);

  const changeTo = (newIdx: number) => {
    currentRef.current = newIdx;
    setCurrent(newIdx);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newIdx = (currentRef.current + 1) % photos.length;
      changeTo(newIdx);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevPhoto = () => changeTo((current - 1 + photos.length) % photos.length);
  const nextPhoto = () => changeTo((current + 1) % photos.length);

  return (
    <div className="min-h-screen bg-white text-[#1C1917]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5">
        <span className="text-sm tracking-wide font-light text-white drop-shadow-sm">
          Jonah Bernstein-Schalet
        </span>
        <a
          href="#publications"
          className="text-sm tracking-wide text-white/80 hover:text-white transition-colors drop-shadow-sm"
        >
          Publications
        </a>
      </nav>

      {/* Gallery */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* Filmstrip — all images in a row, slides on translateX */}
        <div
          className="absolute inset-0 flex"
          style={{
            width: `${photos.length * 100}%`,
            transform: `translateX(-${(current / photos.length) * 100}%)`,
            transition: 'transform 700ms cubic-bezier(0.77, 0, 0.175, 1)',
          }}
        >
          {photos.map((photo, i) => (
            <div key={i} className="relative h-full" style={{ width: `${100 / photos.length}%` }}>
              <Image
                src={photo.src}
                alt={photo.caption || 'Field photograph'}
                fill
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Caption */}
        {photos[current].caption && (
          <div className="absolute bottom-10 left-8 z-10">
            <p
              className="text-white text-sm italic"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
            >
              {photos[current].caption}
            </p>
          </div>
        )}

        {/* Prev / Next */}
        <button
          onClick={prevPhoto}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors text-xl px-3 py-4 select-none"
          aria-label="Previous photo"
        >
          &#8592;
        </button>
        <button
          onClick={nextPhoto}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors text-xl px-3 py-4 select-none"
          aria-label="Next photo"
        >
          &#8594;
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-10 right-8 z-10 flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => changeTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? 'bg-white' : 'bg-white/35'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Publications */}
      <section id="publications" className="max-w-2xl mx-auto px-8 py-24">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-12">
          Publications
        </p>
        <div className="space-y-0">
          {publications.map((pub, i) => (
            <div key={i} className="border-t border-stone-100 py-9">
              <a
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="group block mb-3"
              >
                <h3 className="text-base font-medium leading-snug group-hover:text-stone-500 transition-colors">
                  {pub.title}
                </h3>
              </a>
              <p className="text-sm text-stone-400 leading-relaxed mb-2">
                {pub.authors.map((author, j) => (
                  <span key={j}>
                    {author.includes('Bernstein-Schalet') ? (
                      <strong className="text-stone-600 font-medium">{author}</strong>
                    ) : (
                      author
                    )}
                    {j < pub.authors.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
              <p className="text-xs text-stone-300">{pub.year}</p>
            </div>
          ))}
          <div className="border-t border-stone-100" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-stone-300">
        <p>&#169; {new Date().getFullYear()} Jonah Bernstein-Schalet</p>
      </footer>
    </div>
  );
}
