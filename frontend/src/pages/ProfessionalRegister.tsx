import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Building2, Phone, User, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProfessionalRegister: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    companySize: '',
    sector: '',
    city: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }

    if (!formData.acceptTerms) {
      setError(language === 'fr' ? 'Vous devez accepter les conditions d\'utilisation' : 'You must accept the terms of use');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/professionnel/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo cameroonTravail.png" 
              alt="Cameroon Travail" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'fr' ? 'Créer votre compte recruteur' : 'Create your recruiter account'}
          </h1>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Rejoignez plus de 2,500 entreprises qui recrutent avec Cameroon Travail'
              : 'Join over 2,500 companies recruiting with Cameroon Travail'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Company Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Informations sur l\'entreprise' : 'Company Information'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'} *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={language === 'fr' ? 'Ex: Tech Solutions Cameroun' : 'Ex: Tech Solutions Cameroon'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Secteur d\'activité' : 'Industry sector'} *
                  </label>
                  <select
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner un secteur' : 'Select a sector'}</option>
                    <option value="technology">{language === 'fr' ? 'Technologie' : 'Technology'}</option>
                    <option value="finance">{language === 'fr' ? 'Finance' : 'Finance'}</option>
                    <option value="healthcare">{language === 'fr' ? 'Santé' : 'Healthcare'}</option>
                    <option value="education">{language === 'fr' ? 'Éducation' : 'Education'}</option>
                    <option value="retail">{language === 'fr' ? 'Commerce' : 'Retail'}</option>
                    <option value="manufacturing">{language === 'fr' ? 'Industrie' : 'Manufacturing'}</option>
                    <option value="other">{language === 'fr' ? 'Autre' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Taille de l\'entreprise' : 'Company size'} *
                  </label>
                  <select
                    required
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner la taille' : 'Select size'}</option>
                    <option value="1-10">1-10 {language === 'fr' ? 'employés' : 'employees'}</option>
                    <option value="11-50">11-50 {language === 'fr' ? 'employés' : 'employees'}</option>
                    <option value="51-200">51-200 {language === 'fr' ? 'employés' : 'employees'}</option>
                    <option value="201-1000">201-1000 {language === 'fr' ? 'employés' : 'employees'}</option>
                    <option value="1000+">1000+ {language === 'fr' ? 'employés' : 'employees'}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Ville' : 'City'} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={language === 'fr' ? 'Ex: Douala' : 'Ex: Douala'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Personne de contact' : 'Contact Person'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Prénom' : 'First name'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Jean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Nom' : 'Last name'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Poste occupé' : 'Position'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={language === 'fr' ? 'Ex: Responsable RH' : 'Ex: HR Manager'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Téléphone' : 'Phone'} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+237 6XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Email professionnel' : 'Professional email'} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="jean.dupont@entreprise.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Sécurité du compte' : 'Account Security'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Mot de passe' : 'Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  {language === 'fr' ? 'J\'accepte les' : 'I accept the'}{' '}
                  <Link to="/conditions" className="text-orange-600 hover:text-orange-500">
                    {language === 'fr' ? 'conditions d\'utilisation' : 'terms of use'}
                  </Link>{' '}
                  {language === 'fr' ? 'et la' : 'and the'}{' '}
                  <Link to="/confidentialite" className="text-orange-600 hover:text-orange-500">
                    {language === 'fr' ? 'politique de confidentialité' : 'privacy policy'}
                  </Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                  {language === 'fr' 
                    ? 'Je souhaite recevoir les conseils recrutement et les actualités de Cameroon Travail'
                    : 'I want to receive recruitment tips and Cameroon Travail news'
                  }
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (language === 'fr' ? 'Création du compte...' : 'Creating account...')
                  : (language === 'fr' ? 'Créer mon compte recruteur' : 'Create my recruiter account')
                }
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 'Vous avez déjà un compte ?' : 'Already have an account?'}{' '}
              <Link to="/professionnel/connexion" className="text-orange-600 hover:text-orange-500 font-medium">
                {language === 'fr' ? 'Se connecter' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>

        {/* Alternative Registration */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'fr' ? 'Besoin d\'aide pour vous inscrire ?' : 'Need help registering?'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'fr' 
              ? 'Nos conseillers sont là pour vous accompagner dans votre inscription'
              : 'Our advisors are here to help you with your registration'
            }
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto">
            <Phone className="mr-2 w-5 h-5" />
            {language === 'fr' ? 'Être rappelé par un conseiller' : 'Request a callback from an advisor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegister;