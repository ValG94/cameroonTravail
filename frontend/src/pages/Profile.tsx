import React, { useState } from 'react';
import { Camera, MapPin, Phone, Mail, Calendar, Briefcase, GraduationCap, Award, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: t('profile.personal'), icon: <Mail className="w-4 h-4" /> },
    { id: 'experience', label: t('profile.experience'), icon: <Briefcase className="w-4 h-4" /> },
    { id: 'education', label: t('profile.education'), icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'skills', label: t('profile.skills'), icon: <Award className="w-4 h-4" /> },
    { id: 'languages', label: t('profile.languages'), icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600 mb-2">Développeur Full Stack</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                <div className="flex items-center justify-center sm:justify-start">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Douala, Cameroun</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <Phone className="w-4 h-4 mr-1" />
                  <span>{user?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-colors min-w-max ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('profile.personal')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.firstName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.lastName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    defaultValue={user?.phone}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    defaultValue="Douala"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  À propos de moi
                </label>
                <textarea
                  rows={4}
                  placeholder="Décrivez-vous en quelques lignes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('profile.experience')}
                </h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Ajouter une expérience
                </button>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Développeur Full Stack Senior</h3>
                      <p className="text-green-600 font-medium">Tech Solutions Cameroun</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {t('common.edit')}
                    </button>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Janvier 2022 - Présent</span>
                  </div>
                  <p className="text-gray-600">
                    Développement d'applications web modernes avec React, Node.js et PostgreSQL.
                    Encadrement d'une équipe de 3 développeurs juniors.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Développeur Frontend</h3>
                      <p className="text-green-600 font-medium">Startup Innov</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {t('common.edit')}
                    </button>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Mars 2020 - Décembre 2021</span>
                  </div>
                  <p className="text-gray-600">
                    Création d'interfaces utilisateur réactives et intuitives.
                    Optimisation des performances et de l'expérience utilisateur.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('profile.education')}
                </h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Ajouter une formation
                </button>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Master en Informatique</h3>
                      <p className="text-green-600 font-medium">Université de Yaoundé I</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {t('common.edit')}
                    </button>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>2018 - 2020</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Licence en Informatique</h3>
                      <p className="text-green-600 font-medium">Université de Douala</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {t('common.edit')}
                    </button>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>2015 - 2018</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('profile.skills')}
                </h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Ajouter une compétence
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Compétences techniques</h3>
                  <div className="space-y-3">
                    {['JavaScript', 'React', 'Node.js', 'Python', 'PostgreSQL'].map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-gray-700">{skill}</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full ${
                                level <= 4 ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Compétences transversales</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Leadership', 'Gestion de projet', 'Communication', 'Travail en équipe', 'Problem solving'].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'languages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('profile.languages')}
                </h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Ajouter une langue
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { language: 'Français', level: 'Langue maternelle' },
                  { language: 'Anglais', level: 'Courant' },
                  { language: 'Allemand', level: 'Intermédiaire' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.language}</h3>
                      <p className="text-gray-600">{item.level}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {t('common.edit')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;