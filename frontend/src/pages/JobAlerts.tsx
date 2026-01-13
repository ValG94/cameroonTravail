import React, { useState } from 'react';
import { Plus, Bell, MapPin, Briefcase, Clock, Settings, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const JobAlerts: React.FC = () => {
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const alerts = [
    {
      id: 1,
      title: 'Développeur Full Stack',
      location: 'Douala',
      frequency: 'Quotidien',
      created: '12 janvier 2024',
      active: true,
      matchCount: 5,
    },
    {
      id: 2,
      title: 'Responsable Marketing',
      location: 'Yaoundé',
      frequency: 'Hebdomadaire',
      created: '5 janvier 2024',
      active: true,
      matchCount: 2,
    },
    {
      id: 3,
      title: 'Comptable',
      location: 'Toutes les villes',
      frequency: 'Quotidien',
      created: '28 décembre 2023',
      active: false,
      matchCount: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mes alertes emploi
              </h1>
              <p className="text-gray-600">
                Recevez des notifications pour les nouvelles offres correspondant à vos critères
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle alerte</span>
            </button>
          </div>

          {/* Create Alert Form */}
          {showCreateForm && (
            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Créer une nouvelle alerte
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mots-clés
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Développeur, Marketing..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Douala, Yaoundé..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Tous les types</option>
                    <option>CDI</option>
                    <option>CDD</option>
                    <option>Stage</option>
                    <option>Freelance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Quotidien</option>
                    <option>Hebdomadaire</option>
                    <option>Immédiat</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Créer l'alerte
                </button>
              </div>
            </div>
          )}

          {/* Alerts List */}
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Bell className={`w-5 h-5 ${alert.active ? 'text-green-500' : 'text-gray-400'}`} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alert.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {alert.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {alert.frequency}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {alert.matchCount} nouvelles offres
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Créée le {alert.created}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {alert.matchCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                      Voir les {alert.matchCount} nouvelles offres
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Alerts State */}
          {alerts.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune alerte configurée
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre première alerte pour être notifié des nouvelles opportunités
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Créer ma première alerte
              </button>
            </div>
          )}

          {/* Settings Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paramètres des notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notifications par email</h4>
                  <p className="text-sm text-gray-600">Recevez les alertes par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notifications push</h4>
                  <p className="text-sm text-gray-600">Recevez les alertes instantanément</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Résumé hebdomadaire</h4>
                  <p className="text-sm text-gray-600">Recevez un résumé chaque semaine</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAlerts;