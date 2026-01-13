import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  CameraIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  AwardIcon,
  GlobeIcon,
  UserIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  UploadIcon
} from '../components/Icons';

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profilePhoto: string | null;
  completionPercentage: number;
}

interface Experience {
  id?: number;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  currentJob: boolean;
  description: string;
}

interface Education {
  id?: number;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  currentlyEnrolled: boolean;
  description: string;
}

interface Skill {
  id?: number;
  name: string;
  level: number;
}

interface Language {
  id?: number;
  name: string;
  proficiency: string;
}

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Form states
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showLanguageForm, setShowLanguageForm] = useState(false);

  // Upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'personal', label: 'Informations personnelles', icon: <UserIcon size={18} /> },
    { id: 'experience', label: 'Expérience', icon: <BriefcaseIcon size={18} /> },
    { id: 'education', label: 'Formation', icon: <GraduationCapIcon size={18} /> },
    { id: 'skills', label: 'Compétences', icon: <AwardIcon size={18} /> },
    { id: 'languages', label: 'Langues', icon: <GlobeIcon size={18} /> },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [profileRes, expRes, eduRes, skillsRes, langsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/profile', config),
        axios.get('http://localhost:3001/api/profile/experiences', config),
        axios.get('http://localhost:3001/api/profile/education', config),
        axios.get('http://localhost:3001/api/profile/skills', config),
        axios.get('http://localhost:3001/api/profile/languages', config),
      ]);

      setProfile(profileRes.data.profile);
      setExperiences(expRes.data.experiences || []);
      setEducation(eduRes.data.education || []);
      setSkills(skillsRes.data.skills || []);
      setLanguages(langsRes.data.languages || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      bio: formData.get('bio'),
    };

    try {
      const response = await axios.put(
        'http://localhost:3001/api/profile/personal-info',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.profile);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const saveExperience = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      jobTitle: formData.get('jobTitle'),
      company: formData.get('company'),
      location: formData.get('location'),
      startDate: formData.get('startDate'),
      endDate: formData.get('currentJob') ? null : formData.get('endDate'),
      currentJob: formData.get('currentJob') === 'on',
      description: formData.get('description'),
    };

    try {
      if (editingExperience?.id) {
        await axios.put(
          `http://localhost:3001/api/profile/experiences/${editingExperience.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:3001/api/profile/experiences',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await fetchProfileData();
      setShowExperienceForm(false);
      setEditingExperience(null);
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) return;
    
    try {
      await axios.delete(
        `http://localhost:3001/api/profile/experiences/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfileData();
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const saveEducation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      degree: formData.get('degree'),
      institution: formData.get('institution'),
      fieldOfStudy: formData.get('fieldOfStudy'),
      startDate: formData.get('startDate'),
      endDate: formData.get('currentlyEnrolled') ? null : formData.get('endDate'),
      currentlyEnrolled: formData.get('currentlyEnrolled') === 'on',
      description: formData.get('description'),
    };

    try {
      if (editingEducation?.id) {
        await axios.put(
          `http://localhost:3001/api/profile/education/${editingEducation.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:3001/api/profile/education',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await fetchProfileData();
      setShowEducationForm(false);
      setEditingEducation(null);
    } catch (error) {
      console.error('Error saving education:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteEducation = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;
    
    try {
      await axios.delete(
        `http://localhost:3001/api/profile/education/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfileData();
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const saveSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      level: parseInt(formData.get('level') as string),
    };

    try {
      if (editingSkill?.id) {
        await axios.put(
          `http://localhost:3001/api/profile/skills/${editingSkill.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:3001/api/profile/skills',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await fetchProfileData();
      setShowSkillForm(false);
      setEditingSkill(null);
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) return;
    
    try {
      await axios.delete(
        `http://localhost:3001/api/profile/skills/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfileData();
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const saveLanguage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      proficiency: formData.get('proficiency'),
    };

    try {
      if (editingLanguage?.id) {
        await axios.put(
          `http://localhost:3001/api/profile/languages/${editingLanguage.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:3001/api/profile/languages',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await fetchProfileData();
      setShowLanguageForm(false);
      setEditingLanguage(null);
    } catch (error) {
      console.error('Error saving language:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteLanguage = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette langue ?')) return;
    
    try {
      await axios.delete(
        `http://localhost:3001/api/profile/languages/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfileData();
    } catch (error) {
      console.error('Error deleting language:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Upload de photo de profil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/profile/upload-photo',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Photo de profil mise à jour avec succès !');
      await fetchProfileData();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Upload de CV avec extraction IA
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le CV ne doit pas dépasser 10MB');
      return;
    }

    if (!confirm('L\'upload du CV va extraire automatiquement vos informations et remplir votre profil. Continuer ?')) {
      return;
    }

    setUploadingCV(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/profile/upload-cv',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('CV analysé avec succès ! Votre profil a été mis à jour.');
      await fetchProfileData();
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Erreur lors de l\'upload du CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const renderSkillLevel = (level: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`w-3 h-3 rounded-full ${
              dot <= level ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec photo de profil et barre de progression */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Photo de profil */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </span>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" />
                ) : (
                  <CameraIcon size={16} className="text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Informations principales */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{profile?.bio || 'Aucune bio'}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-500">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPinIcon size={16} className="mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <MailIcon size={16} className="mr-1" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center">
                    <PhoneIcon size={16} className="mr-1" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Profil complété</span>
                  <span className="font-semibold text-green-600">{profile?.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profile?.completionPercentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Bouton d'upload de CV */}
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className={`inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer ${
                    uploadingCV ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingCV ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon size={18} />
                      <span>Importer mon CV (PDF)</span>
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  L'IA analysera votre CV et remplira automatiquement votre profil
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          {/* Onglet Informations personnelles */}
          {activeTab === 'personal' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
              
              <form onSubmit={updatePersonalInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={profile?.firstName}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={profile?.lastName}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={profile?.phone}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={profile?.location}
                      placeholder="Ville, Pays"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      defaultValue={profile?.bio}
                      rows={4}
                      placeholder="Parlez-nous de vous..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <SaveIcon size={18} />
                    <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Onglet Expérience */}
          {activeTab === 'experience' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Expérience professionnelle</h2>
                <button
                  onClick={() => {
                    setEditingExperience(null);
                    setShowExperienceForm(true);
                  }}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <PlusIcon size={18} />
                  <span>Ajouter</span>
                </button>
              </div>

              {showExperienceForm && (
                <form onSubmit={saveExperience} className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {editingExperience ? 'Modifier l\'expérience' : 'Nouvelle expérience'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poste <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        defaultValue={editingExperience?.jobTitle}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        defaultValue={editingExperience?.company}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        name="location"
                        defaultValue={editingExperience?.location}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="month"
                        name="startDate"
                        defaultValue={editingExperience?.startDate}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="month"
                        name="endDate"
                        defaultValue={editingExperience?.endDate || ''}
                        disabled={editingExperience?.currentJob}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="currentJob"
                        id="currentJob"
                        defaultChecked={editingExperience?.currentJob}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="currentJob" className="ml-2 text-sm text-gray-700">
                        Je travaille actuellement ici
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        defaultValue={editingExperience?.description}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowExperienceForm(false);
                        setEditingExperience(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <SaveIcon size={18} />
                      <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Liste des expériences */}
              <div className="space-y-4">
                {experiences.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune expérience ajoutée</p>
                ) : (
                  experiences.map((exp) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                          <p className="text-green-600 font-medium">{exp.company}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarIcon size={14} className="mr-1" />
                            <span>
                              {exp.startDate} - {exp.currentJob ? 'Présent' : exp.endDate}
                            </span>
                            {exp.location && (
                              <>
                                <span className="mx-2">•</span>
                                <MapPinIcon size={14} className="mr-1" />
                                <span>{exp.location}</span>
                              </>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingExperience(exp);
                              setShowExperienceForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => exp.id && deleteExperience(exp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Onglet Formation */}
          {activeTab === 'education' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Formation</h2>
                <button
                  onClick={() => {
                    setEditingEducation(null);
                    setShowEducationForm(true);
                  }}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <PlusIcon size={18} />
                  <span>Ajouter</span>
                </button>
              </div>

              {showEducationForm && (
                <form onSubmit={saveEducation} className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {editingEducation ? 'Modifier la formation' : 'Nouvelle formation'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diplôme <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="degree"
                        defaultValue={editingEducation?.degree}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Établissement <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="institution"
                        defaultValue={editingEducation?.institution}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domaine d'études
                      </label>
                      <input
                        type="text"
                        name="fieldOfStudy"
                        defaultValue={editingEducation?.fieldOfStudy}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="month"
                        name="startDate"
                        defaultValue={editingEducation?.startDate}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="month"
                        name="endDate"
                        defaultValue={editingEducation?.endDate || ''}
                        disabled={editingEducation?.currentlyEnrolled}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="currentlyEnrolled"
                        id="currentlyEnrolled"
                        defaultChecked={editingEducation?.currentlyEnrolled}
                        className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="currentlyEnrolled" className="ml-2 text-sm text-gray-700">
                        Formation en cours
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        defaultValue={editingEducation?.description}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEducationForm(false);
                        setEditingEducation(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <SaveIcon size={18} />
                      <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Liste des formations */}
              <div className="space-y-4">
                {education.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune formation ajoutée</p>
                ) : (
                  education.map((edu) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-green-600 font-medium">{edu.institution}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarIcon size={14} className="mr-1" />
                            <span>
                              {edu.startDate} - {edu.currentlyEnrolled ? 'En cours' : edu.endDate}
                            </span>
                          </div>
                          {edu.description && (
                            <p className="text-gray-600 mt-2 text-sm">{edu.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingEducation(edu);
                              setShowEducationForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => edu.id && deleteEducation(edu.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Onglet Compétences */}
          {activeTab === 'skills' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Compétences</h2>
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setShowSkillForm(true);
                  }}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <PlusIcon size={18} />
                  <span>Ajouter</span>
                </button>
              </div>

              {showSkillForm && (
                <form onSubmit={saveSkill} className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {editingSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la compétence <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingSkill?.name}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau (1-5) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="range"
                        name="level"
                        min="1"
                        max="5"
                        defaultValue={editingSkill?.level || 3}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Débutant</span>
                        <span>Intermédiaire</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillForm(false);
                        setEditingSkill(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <SaveIcon size={18} />
                      <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Liste des compétences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 col-span-2">Aucune compétence ajoutée</p>
                ) : (
                  skills.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{skill.name}</h3>
                          {renderSkillLevel(skill.level)}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingSkill(skill);
                              setShowSkillForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => skill.id && deleteSkill(skill.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Onglet Langues */}
          {activeTab === 'languages' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Langues</h2>
                <button
                  onClick={() => {
                    setEditingLanguage(null);
                    setShowLanguageForm(true);
                  }}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <PlusIcon size={18} />
                  <span>Ajouter</span>
                </button>
              </div>

              {showLanguageForm && (
                <form onSubmit={saveLanguage} className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {editingLanguage ? 'Modifier la langue' : 'Nouvelle langue'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingLanguage?.name}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="proficiency"
                        defaultValue={editingLanguage?.proficiency || 'intermediate'}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="beginner">Débutant</option>
                        <option value="intermediate">Intermédiaire</option>
                        <option value="advanced">Avancé</option>
                        <option value="native">Langue maternelle</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLanguageForm(false);
                        setEditingLanguage(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <SaveIcon size={18} />
                      <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Liste des langues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {languages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 col-span-2">Aucune langue ajoutée</p>
                ) : (
                  languages.map((lang) => (
                    <div key={lang.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{lang.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {lang.proficiency === 'beginner' && 'Débutant'}
                            {lang.proficiency === 'intermediate' && 'Intermédiaire'}
                            {lang.proficiency === 'advanced' && 'Avancé'}
                            {lang.proficiency === 'native' && 'Langue maternelle'}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingLanguage(lang);
                              setShowLanguageForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => lang.id && deleteLanguage(lang.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
