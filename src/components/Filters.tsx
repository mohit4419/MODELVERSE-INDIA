/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SlidersHorizontal, MapPin, X, Target, RefreshCw } from 'lucide-react';
import { getCityCoordinates } from '../utils/location';
import PlaceAutocomplete from './PlaceAutocomplete';

interface FiltersProps {
  location: string;
  setLocation: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  ageRange: [number, number];
  setAgeRange: (val: [number, number]) => void;
  heightClass: string;
  setHeightClass: (val: string) => void;
  experience: string;
  setExperience: (val: string) => void;
  budgetLimit: number;
  setBudgetLimit: (val: number) => void;
  onlyVerified: boolean;
  setOnlyVerified: (val: boolean) => void;
  availableOnly: boolean;
  setAvailableOnly: (val: boolean) => void;
  onReset: () => void;
  // Radius targeting props
  radius: number;
  setRadius: (val: number) => void;
  projectCoords: { lat: number; lng: number } | null;
  setProjectCoords: (val: { lat: number; lng: number } | null) => void;
  projectName: string;
  setProjectName: (val: string) => void;
  triggerToast?: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function Filters({
  location,
  setLocation,
  category,
  setCategory,
  gender,
  setGender,
  ageRange,
  setAgeRange,
  heightClass,
  setHeightClass,
  experience,
  setExperience,
  budgetLimit,
  setBudgetLimit,
  onlyVerified,
  setOnlyVerified,
  availableOnly,
  setAvailableOnly,
  onReset,
  radius,
  setRadius,
  projectCoords,
  setProjectCoords,
  projectName,
  setProjectName,
  triggerToast,
}: FiltersProps) {
  
  const [isFetchingGPS, setIsFetchingGPS] = React.useState(false);
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];

  interface SavedSearch {
    id: string;
    name: string;
    location: string;
    category: string;
    gender: string;
    ageRange: [number, number];
    heightClass: string;
    experience: string;
    budgetLimit: number;
    onlyVerified: boolean;
    availableOnly?: boolean;
    radius: number;
    projectCoords: { lat: number; lng: number } | null;
    projectName: string;
  }

  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [newSearchName, setNewSearchName] = React.useState('');

  React.useEffect(() => {
    const loaded = localStorage.getItem('couture_saved_searches');
    if (loaded) {
      try {
        setSavedSearches(JSON.parse(loaded));
      } catch (e) {
        console.error('Error parsing saved searches:', e);
      }
    }
  }, []);

  const handleSaveSearch = () => {
    // Generate a nice default name if empty
    let autoName = '';
    const parts = [];
    if (projectName) parts.push(projectName);
    else if (location) parts.push(location);
    if (category) parts.push(category);
    if (gender) parts.push(gender);
    if (radius && radius !== Infinity && (projectName || location)) parts.push(`<${radius}km`);
    
    autoName = parts.join(' • ') || 'Custom Search';

    const displayName = newSearchName.trim() || autoName;

    const newSearch: SavedSearch = {
      id: 'search_' + Date.now(),
      name: displayName,
      location,
      category,
      gender,
      ageRange,
      heightClass,
      experience,
      budgetLimit,
      onlyVerified,
      availableOnly,
      radius,
      projectCoords,
      projectName
    };

    const updated = [newSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('couture_saved_searches', JSON.stringify(updated));
    setNewSearchName('');
  };

  const handleApplySearch = (srch: SavedSearch) => {
    setLocation(srch.location);
    setCategory(srch.category);
    setGender(srch.gender);
    setAgeRange(srch.ageRange);
    setHeightClass(srch.heightClass);
    setExperience(srch.experience);
    setBudgetLimit(srch.budgetLimit);
    setOnlyVerified(srch.onlyVerified);
    setAvailableOnly(srch.availableOnly || false);
    setRadius(srch.radius !== undefined ? srch.radius : Infinity);
    setProjectCoords(srch.projectCoords || null);
    setProjectName(srch.projectName || '');
  };

  const handleDeleteSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('couture_saved_searches', JSON.stringify(updated));
  };

  const handleCitySelect = (city: string) => {
    setLocation(city);
    if (!city) {
      setProjectName('');
      setProjectCoords(null);
    } else {
      setProjectName(city);
      const coords = getCityCoordinates(city);
      setProjectCoords(coords);
    }
  };

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      if (triggerToast) {
        triggerToast('GPS Error', 'Geolocation is not supported by your browser.', 'error');
      } else {
        alert('Geolocation is not supported by your browser.');
      }
      return;
    }
    setIsFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsFetchingGPS(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setProjectCoords(coords);
        setProjectName('Live GPS');
        setLocation(''); // Clear exact city name selection so radius works globally
      },
      (err) => {
        setIsFetchingGPS(false);
        if (triggerToast) {
          triggerToast('Location Access Failed', err.message || 'Unable to access your current location. Please grant permission.', 'warning');
        } else {
          alert(err.message || 'Unable to access your current location. Please grant permission.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const categories = [
    'Fashion Models',
    'Commercial Models',
    'Fitness Models',
    'Influencers',
    'UGC Creators',
    'Actors',
    'Event Hosts',
    'Promotional Models',
    'Brand Ambassadors'
  ];
  const heights = [
    { label: 'All Heights', value: '' },
    { label: 'Petite (< 5\'6")', value: 'petite' },
    { label: 'Standard (5\'6" - 5\'9")', value: 'medium' },
    { label: 'Tall (> 5\'9")', value: 'tall' }
  ];
  const experiences = ['Fresh Face', '2-5 years', '5+ years'];

  return (
    <div id="models-catalog-filters" className="rounded-3xl border border-neutral-150 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-md text-left text-neutral-800 dark:text-neutral-100">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-4">
        <div className="flex items-center space-x-2 text-neutral-800 dark:text-neutral-100">
          <SlidersHorizontal className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 animate-pulse" />
          <h3 className="font-sans text-sm font-black tracking-wider uppercase">Casting Controls</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs font-black text-pink-650 hover:text-pink-700 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="mt-5 space-y-6">
        
        {/* Saved Searches & Presets */}
        <div id="saved-searches-section" className="rounded-2xl border border-neutral-150 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-950/40 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">Saved Casting Presets</span>
            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full font-mono">
              {savedSearches.length} Saved
            </span>
          </div>

          {/* Quick chip display of existing searches */}
          {savedSearches.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin pr-1">
              {savedSearches.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleApplySearch(s)}
                  className="group/chip flex items-center space-x-1.5 bg-white dark:bg-neutral-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-neutral-200 dark:border-white/10 hover:border-purple-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 transition shadow-xs cursor-pointer select-none"
                >
                  <span className="font-bold truncate max-w-[120px]">{s.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSearch(s.id, e)}
                    className="p-0.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-400 dark:text-neutral-500 hover:text-rose-500 transition-colors shrink-0 cursor-pointer animate-fadeIn"
                    title="Delete Search Preset"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-neutral-400 italic">No saved search criteria yet. Configure parameters and save!</p>
          )}

          {/* Form to save current query */}
          <div className="flex space-x-2 pt-1 border-t border-neutral-100/50 dark:border-white/5">
            <input
              type="text"
              placeholder="e.g. Mumbai UGC Creators"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              className="flex-1 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-purple-500 shadow-inner"
            />
            <button
              onClick={handleSaveSearch}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-black shadow-sm transition-all duration-200 cursor-pointer text-center whitespace-nowrap"
            >
              Save Search
            </button>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono mb-2.5">Project City</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCitySelect('')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                location === '' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black shadow-md shadow-pink-500/10' 
                  : 'bg-[#FCFBF9] dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              All India
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => handleCitySelect(loc)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                  location === loc 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black shadow-md shadow-pink-500/10' 
                    : 'bg-[#FCFBF9] dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Project Location Search Radius */}
        <div className="rounded-2xl border border-dashed border-purple-250 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/10 p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-100 dark:border-white/5">
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="text-[10px] font-black text-purple-700 dark:text-purple-350 uppercase tracking-widest font-mono">Radius Targeting</span>
            </div>
            {projectName && (
              <span className="text-[9px] px-2 py-0.5 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-extrabold rounded-full font-mono truncate max-w-[140px] shadow-sm">
                Near: {projectName}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Google Places Autocomplete */}
            <div>
              <label className="block text-[9px] font-black uppercase text-purple-700 tracking-wider mb-1.5 font-mono">Google Maps Autocomplete</label>
              <PlaceAutocomplete
                onPlaceSelect={(name, coords) => {
                  if (!name || !coords) {
                    setProjectName('');
                    setProjectCoords(null);
                    if (!name) {
                      setLocation('');
                    }
                  } else {
                    setProjectName(name);
                    setProjectCoords(coords);
                    setLocation(''); // Clear simple city text selection so radius matching takes over
                    if (radius === Infinity) {
                      setRadius(250); // Automatically set a functional 250km radius so they see nearby results immediately
                    }
                  }
                }}
                initialValue={projectName !== 'Live GPS' ? projectName : ''}
                placeholder="Type city or area (e.g. Bandra, Mumbai)..."
              />
            </div>

            {/* GPS Trigger / Center Selection */}
            <button
              type="button"
              onClick={handleFetchLiveLocation}
              disabled={isFetchingGPS}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 active:scale-[0.98] border border-neutral-250 dark:border-white/10 text-neutral-800 dark:text-neutral-100 disabled:opacity-75 text-[11px] font-extrabold rounded-xl shadow-sm transition cursor-pointer"
            >
              {isFetchingGPS ? (
                <span className="inline-block h-3.5 w-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Target className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
              )}
              <span>{isFetchingGPS ? 'Locking GPS Coordinates...' : 'Use My Current Live GPS'}</span>
            </button>

            {/* Slider for Distance */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Max Radius Distance</span>
                <span className="text-xs font-mono font-black text-purple-700">
                  {radius === Infinity ? 'Unlimited (All India)' : `${radius} km`}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1050"
                step="50"
                value={radius === Infinity ? 1050 : radius}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRadius(val >= 1050 ? Infinity : val);
                }}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between font-mono text-[8px] text-neutral-400 mt-1">
                <span>50 km</span>
                <span>500 km</span>
                <span>1000 km</span>
                <span>Unlimited</span>
              </div>
            </div>

            {projectCoords ? (
              <p className="text-[9px] text-purple-600 dark:text-purple-400 leading-tight bg-white dark:bg-neutral-800 border border-purple-100/50 dark:border-purple-900/40 p-2 rounded-lg font-mono">
                Lat: {projectCoords.lat.toFixed(4)}, Lng: {projectCoords.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-tight">
                Select a project city above or use your current live GPS to center the distance search.
              </p>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono mb-2.5">Talent Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-neutral-800 px-3.5 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="" className="text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono mb-2.5">Gender</label>
          <div className="grid grid-cols-3 gap-2">
            {['female', 'male', 'non-binary'].map((g) => (
              <button
                key={g}
                onClick={() => setGender(gender === g ? '' : g)}
                className={`rounded-xl py-2 text-center text-xs font-bold capitalize transition cursor-pointer ${
                  gender === g 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                    : 'bg-[#FCFBF9] dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">Age Scope</label>
            <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
              {ageRange[0]} - {ageRange[1]} yrs
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="18"
              max="40"
              value={ageRange[0]}
              onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <input
              type="range"
              min="18"
              max="40"
              value={ageRange[1]}
              onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
          </div>
        </div>

        {/* Height Selection */}
        <div>
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono mb-2.5">Height Class</label>
          <div className="grid grid-cols-2 gap-2">
            {heights.map((h) => (
              <button
                key={h.value}
                onClick={() => setHeightClass(h.value)}
                className={`rounded-xl py-2 text-center text-[11px] font-bold transition cursor-pointer ${
                  heightClass === h.value 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-black' 
                    : 'bg-[#FCFBF9] dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Selector */}
        <div>
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono mb-2.5">Experience Scope</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-neutral-800 px-3.5 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="" className="text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900">All Experience Levels</option>
            {experiences.map((exp) => (
              <option key={exp} value={exp} className="text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-900">
                {exp}
              </option>
            ))}
          </select>
        </div>

        {/* Starting Price (Daily Budget) Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">Day Rate Limit</label>
            <span className="text-xs font-mono font-black text-neutral-800 dark:text-neutral-100">
              ₹{budgetLimit.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="100000"
            step="5000"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between font-mono text-[9px] text-neutral-400 dark:text-neutral-500 mt-1">
            <span>₹10K</span>
            <span>₹50K</span>
            <span>₹100K+</span>
          </div>
        </div>

        {/* Verified Profile Checkbox */}
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/55">
          <div className="flex flex-col pr-2">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-400">Selfie Verified</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 leading-tight mt-0.5">Government ID matched face profiles</span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              onlyVerified ? 'bg-emerald-600' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                onlyVerified ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Available Now Toggle */}
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/55">
          <div className="flex flex-col pr-2">
            <span className="text-xs font-black text-amber-800 dark:text-amber-400">Available Now</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-500 leading-tight mt-0.5">Ready for immediate booking</span>
          </div>
          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              availableOnly ? 'bg-amber-600' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                availableOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
