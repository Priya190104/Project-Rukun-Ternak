import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Unified Admin Page Header Component
 * Provides consistent, professional design across all admin pages
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle/description
 * @param {ReactNode} icon - Icon to display in header
 * @param {ReactNode} actionButton - Action button (optional)
 * @param {string} backTo - Back button route (optional)
 * @param {boolean} showBackButton - Whether to show back button
 */
export default function AdminPageHeader({
  title,
  subtitle,
  icon,
  actionButton,
  backTo = '/dashboard',
  showBackButton = true,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-primary-400 to-primary-400 rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left side - Title and subtitle */}
        <div className="flex-1">
          {/* Back button + title row */}
          <div className="flex items-center gap-4 mb-2">
            {showBackButton && (
              <button
                onClick={() => navigate(backTo)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-white"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-3 bg-white/20 rounded-xl">
                  {icon}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-white text-sm md:text-base ml-12 md:ml-0">{subtitle}</p>
          )}
        </div>

        {/* Right side - Action button */}
        {actionButton && (
          <div className="flex items-center">
            {actionButton}
          </div>
        )}
      </div>

      {/* Decorative accent line */}
      <div className="mt-6 h-1 bg-white/20 rounded-full w-24"></div>
    </div>
  );
}

