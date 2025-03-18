import React, { useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import Form from './components/Form';

function App() {
  const [preview, setPreview] = useState(null);
  const previewRef = useRef(null); // Ref to capture the styled preview

  const handleFormSubmit = async (formData) => {
    const { pdfFile, templateSelect, width, height, bgcolor } = formData;

    const data = new FormData();
    data.append('pdf', pdfFile);
    data.append('template', templateSelect);
    data.append('width', width);
    data.append('height', height);
    data.append('bgcolor', bgcolor);

    try {
      const response = await axios.post('https://creative-generator-react-w3l7-e5dz5e8pa.vercel.app/api/extract-first-page', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(response.data); // Store the response for preview
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDownload = async () => {
    if (!preview || !previewRef.current) return;

    try {
      // Capture the styled preview with html2canvas
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null, // Preserve the bgcolor from CSS
        scale: 2, // Higher resolution
      });

      // Get normalized filename from the backend
      const normalizedResponse = await axios.post('https://creative-generator-react-w3l7-e5dz5e8pa.vercel.app/api/normalize-filename', {
        filename: preview.pdf_filename,
      });
      const downloadFilename = normalizedResponse.data.normalized_filename;

      // Trigger download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg');
      link.download = downloadFilename;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="App px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resource Creative Generator</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Preview */}
        <div className="lg:w-2/3">
          {preview ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Creative Preview</h2>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download Creative
                </button>
              </div>
              <div className="border rounded-lg overflow-hidden p-5">
                <div
                  ref={previewRef} // Attach ref to the styled div
                  className={`background ${preview.is_landscape ? 'landscape' : 'portrait'}`}
                  style={{
                    backgroundColor: preview.bgcolor,
                    width: `${preview.width}px`,
                    height: `${preview.height}px`,
                  }}
                >
                  <img
                    src={`data:image/jpeg;base64,${preview.image_data}`}
                    alt="Preview"
                    className="preview-image"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center h-[500px] text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-lg">Upload a PDF to see the preview here!</p>
            </div>
          )}
        </div>
        {/* Right side - Form */}
        <div className="lg:w-1/3">
          <Form onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
}

export default App;