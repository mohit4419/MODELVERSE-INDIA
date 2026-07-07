/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search, Sparkles, Loader2, KeyRound } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface PlaceAutocompleteProps {
  onPlaceSelect: (name: string, coords: { lat: number; lng: number } | null) => void;
  placeholder?: string;
  initialValue?: string;
}

function PlaceAutocompleteInput({ onPlaceSelect, placeholder, initialValue }: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (initialValue !== undefined) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    // Initialize Autocomplete widget
    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
      types: ['(regions)'], // Restrict to cities/regions for better model matchmaking
    };

    const autocompleteInstance = new placesLib.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteInstance);
  }, [placesLib]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place) return;

      const cityName = place.formatted_address || place.name || '';
      const latLng = place.geometry?.location;
      const coords = latLng
        ? { lat: latLng.lat(), lng: latLng.lng() }
        : null;

      setInputValue(cityName);
      onPlaceSelect(cityName, coords);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onPlaceSelect]);

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-neutral-400">
        {placesLib ? (
          <Search className="h-4 w-4 text-purple-600 animate-pulse" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (!e.target.value) {
            onPlaceSelect('', null);
          }
        }}
        placeholder={placeholder || "Search city or district..."}
        className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-neutral-800 pl-10 pr-4 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-purple-500 shadow-inner"
      />
      {placesLib && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[8px] font-black tracking-wider uppercase text-purple-500 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-md font-mono">
          <Sparkles className="h-2 w-2 text-pink-500" />
          <span>Google AI</span>
        </span>
      )}
    </div>
  );
}

export default function PlaceAutocomplete(props: PlaceAutocompleteProps) {
  if (!hasValidKey) {
    return (
      <div className="rounded-2xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/10 p-4 space-y-3">
        <div className="flex items-start space-x-2.5">
          <KeyRound className="h-5 w-5 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-pink-700 dark:text-pink-400">Google Maps Key Required</h4>
            <p className="text-[10px] leading-relaxed text-pink-600 dark:text-pink-300 font-medium">
              Enable high-fidelity radius-based matching. Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> under <strong>Settings (⚙️) &rarr; Secrets</strong> to unlock live autocompletion!
            </p>
          </div>
        </div>

        {/* Fallback traditional manual text search */}
        <div className="pt-2 border-t border-pink-100 dark:border-pink-900/40">
          <label className="block text-[9px] font-black uppercase text-pink-700 dark:text-pink-400 tracking-wider mb-1">Traditional Search (Fallback)</label>
          <input
            type="text"
            value={props.initialValue || ''}
            onChange={(e) => {
              props.onPlaceSelect(e.target.value, null);
            }}
            placeholder="Type city manually..."
            className="w-full rounded-xl border border-pink-200 dark:border-pink-900/40 bg-white/80 dark:bg-neutral-800/80 px-3 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-pink-400"
          />
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <PlaceAutocompleteInput {...props} />
    </APIProvider>
  );
}
