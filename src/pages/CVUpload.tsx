import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, Eye, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CVUpload: React.FC = () => {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.type.includes('document')) {
        setUploadedCV(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedCV(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('cv.title')}
          </h1>
          <p className="text-gray-600 mb-8">
            Téléchargez votre CV pour le rendre visible aux recruteurs
          </p>

          {/* Upload Section */}
          <div className="mb-8">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('cv.upload')}
              </h3>
              <p className="text-gray-600 mb-4">
                Glissez-déposez votre fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t('cv.formats')} • {t('cv.max.size')}
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Sélectionner un fichier
              </button>
            </div>
          </div>

          {/* Uploaded CV Preview */}
          {uploadedCV && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CV téléchargé</h3>
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedCV.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedCV.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setUploadedCV(null)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CV Templates */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Créer un CV en ligne
            </h3>
            <p className="text-gray-600 mb-6">
              Pas de CV ? Créez-en un facilement avec nos modèles professionnels
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Classique', color: 'blue' },
                { name: 'Moderne', color: 'green' },
                { name: 'Créatif', color: 'purple' },
              ].map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                  <div className={`w-16 h-20 bg-${template.color}-100 border-2 border-${template.color}-300 rounded mx-auto mb-4 flex items-center justify-center`}>
                    <FileText className={`w-8 h-8 text-${template.color}-600`} />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                  <button className={`bg-${template.color}-600 hover:bg-${template.color}-700 text-white px-4 py-2 rounded font-medium transition-colors`}>
                    Utiliser ce modèle
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CV History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historique des CV
            </h3>
            
            <div className="space-y-3">
              {[
                { name: 'CV_Jean_Dupont_2024.pdf', date: '15 janvier 2024', status: 'Actif' },
                { name: 'CV_Jean_Dupont_old.pdf', date: '20 décembre 2023', status: 'Archivé' },
              ].map((cv, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{cv.name}</p>
                      <p className="text-sm text-gray-500">Téléchargé le {cv.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      cv.status === 'Actif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cv.status}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Créer un nouveau CV</span>
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors">
              Voir mon profil public
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVUpload;