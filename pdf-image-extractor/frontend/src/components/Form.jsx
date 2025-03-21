import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';
import API_BASE_URL from "../config.js";

const useSelect2 = (options) => {
  const selectRef = useRef(null);

  useEffect(() => {
    const $select = $(selectRef.current).select2(options);

    return () => {
      $select.select2('destroy');
    };
  }, [options]);

  return selectRef;
};

const Form = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    pdfFile: null,
    templateSelect: '',
    width: 800,
    height: 600,
    bgcolor: '#ffffff',
  });
  const [dropdownOptions, setDropdownOptions] = useState({}); // State to hold API-fetched options

  // Fetch dropdown options from the backend API
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/dropdown-options`)
      .then((response) => {
        setDropdownOptions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching dropdown options:', error);
      });
  }, []);

  const selectRef = useSelect2({
    placeholder: 'Search and select a template',
    allowClear: true,
    width: '100%',
  });

  useEffect(() => {
    const $select = $(selectRef.current);
    $select.on('select2:select', (e) => {
      const selectedOption = e.params.data.id;
      const dimensions = dropdownOptions[selectedOption] || { width: 800, height: 600, bgcolor: '#ffffff' };
      setFormData((prev) => ({
        ...prev,
        templateSelect: selectedOption,
        width: dimensions.width,
        height: dimensions.height,
        bgcolor: dimensions.bgcolor,
      }));
    });

    return () => {
      $select.off('select2:select');
    };
  }, [dropdownOptions]); // Add dropdownOptions as a dependency

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
      <div className="mt-0 upload-form bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF</label>
          <input
            type="file"
            name="pdfFile"
            accept=".pdf"
            required
            onChange={handleChange}
            className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select DP</label>
          <select
            ref={selectRef}
            name="templateSelect"
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="">-- Select an option --</option>
            {Object.entries(dropdownOptions).map(([key, values]) => (
              <option key={key} value={key}>
                {values.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
          <input
            type="number"
            name="width"
            value={formData.width}
            min="100"
            max="2000"
            onChange={handleChange}
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            min="100"
            max="2000"
            onChange={handleChange}
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <input
            type="color"
            name="bgcolor"
            value={formData.bgcolor}
            onChange={handleChange}
            className="cursor-pointer mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        className="cursor-pointer w-full bg-blue-600 text-white text-xs py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Generate Creative
      </button>
    </form>
  );
};

export default Form;