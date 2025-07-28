import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  Heart, 
  Star, 
  Zap,
  Globe,
  Award,
  TrendingUp,
  CheckCircle,
  Play,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Removed unused state variables

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Trigger animations on mount
    // Removed setIsVisible call since variable was removed

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Removed unused handleThemeToggle function

  const handleScrollToJoin = () => {
    document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <div className={`welcome-page ${theme}`}>
      {/* Hero Section with Animated Background */}
      <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          {/* Floating Icons */}
          <div className="floating-icon" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>
            <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
          </div>
          <div className="floating-icon" style={{ top: '20%', right: '15%', animationDelay: '2s' }}>
            <Shield className="w-6 h-6 text-blue-400 animate-bounce" />
          </div>
          <div className="floating-icon" style={{ bottom: '30%', left: '20%', animationDelay: '4s' }}>
            <Star className="w-5 h-5 text-yellow-400 animate-spin" />
          </div>
          <div className="floating-icon" style={{ bottom: '20%', right: '25%', animationDelay: '1s' }}>
            <Zap className="w-7 h-7 text-purple-400 animate-pulse" />
          </div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid-pattern"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="animate-fade-in">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  MedBlock
                </h1>
              </div>
              <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-light mb-4">
                Revolutionizing Healthcare in
              </p>
              <div className="flex items-center justify-center space-x-2 mb-8">
                <span className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Kenya</span>
                <span className="text-4xl md:text-5xl">🇰🇪</span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure, transparent, and efficient healthcare management powered by blockchain technology. 
              Connecting patients, doctors, and healthcare providers across Kenya.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <button
                onClick={handleSignUp}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleScrollToJoin}
                className="group border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="stat-card animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="stat-card animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Healthcare Providers</div>
              </div>
              <div className="stat-card animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-3xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="stat-card animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-3xl font-bold text-pink-600">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
      </section>

      {/* Features Section */}
      <section className="feature-section py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose MedBlock?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the future of healthcare with our comprehensive suite of features designed for modern healthcare delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="feature-card animate-on-scroll">
              <div className="icon-wrapper bg-gradient-to-br from-blue-500 to-blue-600">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Blockchain-powered security ensures your medical data is encrypted, tamper-proof, and accessible only to authorized personnel.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.1s' }}>
              <div className="icon-wrapper bg-gradient-to-br from-green-500 to-green-600">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multi-Role Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tailored interfaces for doctors, nurses, patients, and administrators with role-based permissions and workflows.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="icon-wrapper bg-gradient-to-br from-purple-500 to-purple-600">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Digital Records</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete digital transformation of medical records with instant access, search, and sharing capabilities.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.3s' }}>
              <div className="icon-wrapper bg-gradient-to-br from-pink-500 to-pink-600">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI-Powered Chat</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligent chatbot assistance for quick medical queries, appointment scheduling, and health information.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.4s' }}>
              <div className="icon-wrapper bg-gradient-to-br from-yellow-500 to-orange-500">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Analytics & Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced analytics and reporting tools for healthcare providers to track performance and patient outcomes.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="feature-card animate-on-scroll" style={{ animationDelay: '0.5s' }}>
              <div className="icon-wrapper bg-gradient-to-br from-indigo-500 to-indigo-600">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Kenya-Wide Network</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with healthcare providers across all 47 counties in Kenya for comprehensive care coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join-section" className="join-section py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of healthcare professionals and patients already using MedBlock to improve healthcare delivery in Kenya.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={handleSignUp}
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignIn}
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Sign In
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Free to Start</h3>
                <p className="text-blue-100">No upfront costs, start using MedBlock immediately</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Government Approved</h3>
                <p className="text-blue-100">Compliant with Kenyan healthcare regulations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">5-Star Support</h3>
                <p className="text-blue-100">24/7 customer support in English and Swahili</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="resources-section py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Health Resources & Guides
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Access comprehensive health information, medical guides, and educational resources to support your healthcare journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Resource Card 1 */}
            <div className="resource-card animate-on-scroll">
              <div className="relative overflow-hidden rounded-t-xl">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Medical Records" 
                  className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Understanding Your Records</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Learn how to navigate and interpret your MedBlock health records effectively for better healthcare decisions.
                </p>
                <button 
                  onClick={() => navigate('/resources')} 
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 group"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Resource Card 2 */}
            <div className="resource-card animate-on-scroll" style={{ animationDelay: '0.1s' }}>
              <div className="relative overflow-hidden rounded-t-xl">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Teleconsultation" 
                  className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Teleconsultation Guide</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  A comprehensive step-by-step guide to making the most of your virtual consultations and remote healthcare.
                </p>
                <button 
                  onClick={() => navigate('/resources')} 
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 group"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Resource Card 3 */}
            <div className="resource-card animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="relative overflow-hidden rounded-t-xl">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Privacy Policy" 
                  className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Privacy & Security</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Detailed information on how MedBlock protects your data and ensures privacy compliance in healthcare.
                </p>
                <button 
                  onClick={() => navigate('/resources')} 
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 group"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">MedBlock</h3>
              <p className="text-gray-400">
                Revolutionizing healthcare delivery in Kenya through secure, transparent, and efficient digital solutions.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Digital Records</li>
                <li>Teleconsultations</li>
                <li>AI Chat Support</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Facebook</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MedBlock. All rights reserved. Made with ❤️ for Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage; 