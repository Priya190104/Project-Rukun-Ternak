import React, { useState } from 'react';

// Viewer Analisis - Simple development notice modal
export default function ViewerAnalisis() {
  const [showDevModal, setShowDevModal] = useState(true);

  return (
    <>
      {/* Development Modal Only - No Page Content */}
      {showDevModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🔧</div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Fitur Sedang Dikembangkan</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Menu Analisis sedang dalam pengembangan. Kami akan menghadirkan fitur ini segera.
                </p>

                <button
                  onClick={() => setShowDevModal(false)}
                  className="w-full px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
