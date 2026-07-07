/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Model } from '../types';

interface DynamicMetadataProps {
  currentTab: string;
  focusedModel: Model | null;
}

export default function DynamicMetadata({ currentTab, focusedModel }: DynamicMetadataProps) {
  useEffect(() => {
    // 1. Determine metadata values based on current active state
    let title = "Core Cast | India's Premium Casting & Talent Ecosystem";
    let description = "Directly hire verified professional models, actors, and fresh faces across India. Features real-time campaign discussions, secure escrow, and live portfolios.";
    let ogImage = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800"; // default premium brand hero banner
    let url = window.location.href;
    
    // JSON-LD structured schema object
    let schemaJson: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Core Cast",
      "url": "https://ais-pre-3rhhqkkfn73ie5ijpqt3z4-804444971682.asia-southeast1.run.app",
      "description": "Direct hire platform for models and actors in India",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    if (focusedModel) {
      // Model Profile Overrides
      const name = focusedModel.name;
      const cat = focusedModel.category || "Professional Talent";
      const city = focusedModel.city || "Mumbai";
      const experience = focusedModel.experience || "Verified Talent";
      const price = focusedModel.startingPrice ? `₹${focusedModel.startingPrice.toLocaleString('en-IN')}` : "Competitive Rates";
      const bio = focusedModel.biography || `${name} is a high-performance ${cat} based in ${city} registered inside Core Cast Premium Ecosystem.`;
      
      title = `${name} | ${cat} in ${city} - Hire on Core Cast`;
      description = `Hire ${name} (${experience} experience) for your next campaign. Category: ${cat}, Starting at ${price}. View full verified portfolio, stats, and biography.`;
      
      ogImage = `${window.location.origin}/api/og-image/${focusedModel.id}`;

      // Person & JobPosting composite schema representing professional search indexability
      schemaJson = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": name,
        "additionalType": "https://schema.org/Model",
        "gender": focusedModel.gender,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city,
          "addressRegion": focusedModel.state || "India",
          "addressCountry": "IN"
        },
        "description": bio,
        "jobTitle": cat,
        "image": ogImage,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": focusedModel.startingPrice || 10000,
          "availability": "https://schema.org/InStock",
          "description": `Starts at ${price} for premium campaigns`
        }
      };
    } else {
      // Tab-specific metadata definitions
      switch (currentTab) {
        case 'home':
          title = "Core Cast | Premium Casting Ecosystem for India";
          description = "Discover elite fashion models, commercial actors, influencers, and voice artists. Negotiate directly with real-time campaign chat and secure payment releases.";
          break;
        case 'models':
          title = "Find Verified Models across India | Campaign Search Engine";
          description = "Browse high-definition verified profiles with unfiltered selfies. Filter by city, age, starting price, and height. Create custom shortlist boards.";
          schemaJson = {
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": "Top Certified Fashion & Commercial Models - Core Cast Sourcing",
            "description": "Directory of talent available for contract hiring inside India"
          };
          break;
        case 'become-model':
          title = "Become a Verified Model | Top Direct Sourcing Platform";
          description = "Submit your digital portfolio, self-tape cards, and measurements. Direct connects to premium advertising agencies without greedy middlemen cuts.";
          break;
        case 'pricing':
          title = "Escrow Budget Guidelines & Service Pricing | Core Cast Security";
          description = "Complete safety of casting budgets with integrated Razorpay and Cashfree test links. Fully tracked deliverables and automated compliance.";
          break;
        case 'blog':
          title = "Industrial Casting Insights & Best Practices | Modeling Guides";
          description = "Read exclusive masterclass articles on preparing for commercial shoots, styling tips, selfie-verification audits, and building solid port folios.";
          break;
        case 'about':
          title = "Our Sourcing philosophy & Slicing Middleman Agents | About";
          description = "Learn how Core Cast builds automated trust mechanisms using Selfie Audits, Gov ID matching, and smart escrows to revolutionize modeling in India.";
          break;
        case 'contact':
          title = "Talk to Sourcing Managers & Director Support | Contact";
          description = "Need specific casting directions or custom shortlists for bulk campaigns? Our regional scouts and developers are standing by.";
          break;
        case 'chat':
          title = "Secure Real-time Casting Discussions & Auditions | Messenger";
          description = "Access direct secure communications with talent, trade high-resolution self-tapes, and arrange budget contracts.";
          break;
        case 'admin':
          title = "Internal Ecosystem Ledger & Board Dashboard";
          description = "Private secure control interface for verifications, payouts, and dispute resolution.";
          break;
      }
    }

    // 2. Perform live, highly efficient DOM updates directly on document head
    document.title = title;

    // Helper function to upsert a meta tag securely without duplicate clutter
    const updateOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let element = document.head.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard SEO tags
    updateOrCreateMeta('name', 'description', description);
    updateOrCreateMeta('name', 'robots', 'index, follow');

    // Open Graph standard protocol tags (Facebook, WhatsApp, Slack cards)
    updateOrCreateMeta('property', 'og:title', title);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:image', ogImage);
    updateOrCreateMeta('property', 'og:url', url);
    updateOrCreateMeta('property', 'og:type', focusedModel ? 'profile' : 'website');
    updateOrCreateMeta('property', 'og:site_name', 'Core Cast');

    // Twitter card integration
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', title);
    updateOrCreateMeta('name', 'twitter:description', description);
    updateOrCreateMeta('name', 'twitter:image', ogImage);

    // 3. Inject rich structured JSON-LD Schema Script
    let jsonLdScript = document.head.querySelector('script[type="application/ld+json"]#se-structured-schema');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('id', 'se-structured-schema');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(schemaJson);

    // Clean up or reset to baseline on unmount to make SPA garbage-collection fully pristine
    return () => {
      // Keep state values clean if needed, no strict action required since next render will overwrite
    };
  }, [currentTab, focusedModel]);

  // Non-rendering helper utility component
  return null;
}
