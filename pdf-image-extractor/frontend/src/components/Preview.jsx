import React from 'react';

const Preview = ({ imageData, isLandscape, downloadImage }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {imageData ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Creative Preview</h2>
            <button
              onClick={downloadImage}
              className="cursor-pointer inline-flex items-center px-6 py-3 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Creative
            </button>
          </div>
          <div className="preview-container border border-indigo-500/100 rounded-lg overflow-hidden p-5">
            <div
              id="capture"
              className={`background ${isLandscape ? 'landscape' : 'portrait'}`}
              style={{ backgroundColor: '#ffffff', width: '800px', height: '600px' }}
            >
              <img
                src={`data:image/jpeg;base64,${imageData}`}
                alt="First page"
                className="preview-image"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">See the Generated Creative preview here</p>
        </div>
      )}
    </div>
  );
};

export default Preview;