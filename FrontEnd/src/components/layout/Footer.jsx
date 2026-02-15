import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import AppLogo from '../branding/AppLogo';
import SupportedByLogo from '../branding/SupportedByLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-700 mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col items-start">
            <div className="mb-4">
              <AppLogo size="xl" />
            </div>
            {/* Supported By Logo - Dynamic & Configurable */}
            <div className="mb-4">
              <SupportedByLogo size="sm" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Program Rukun Ternak bertujuan meningkatkan kualitas dan produktivitas peternakan di Indonesia melalui edukasi dan pemberdayaan komunitas.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4 text-lg">Kontak</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-700">Alamat</p>
                  <p>Jl. Gunung RT 04 RW 01, Panisihan, Maos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-700">Telepon</p>
                  <p>085169922525</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-700">Email</p>
                  <p>info@rukunternak.id</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>
              &copy; {currentYear} Rukun Ternak. Semua hak dilindungi.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <button
                onClick={() => {}}
                className="hover:text-primary-500 transition text-gray-600"
              >
                Kebijakan Privasi
              </button>
              <button
                onClick={() => {}}
                className="hover:text-primary-500 transition text-gray-600"
              >
                Syarat & Ketentuan
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


