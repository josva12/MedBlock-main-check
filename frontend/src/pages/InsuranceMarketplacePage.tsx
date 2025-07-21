import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import axios from 'axios';
import QuoteRequestModal from '../components/insurance/QuoteRequestModal';

interface InsuranceCompany {
  id: string;
  name: string;
  logo: string;
  rating: number;
  policies: InsurancePolicy[];
  description: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  features: string[];
}

interface InsurancePolicy {
  id: string;
  name: string;
  tier: 'msingi' | 'kati' | 'juu' | 'familia';
  premium: number;
  coverage: number;
  deductible: number;
  features: string[];
  waitingPeriod: number;
  maxAge: number;
}

const InsuranceMarketplacePage: React.FC = () => {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertForm, setExpertForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [expertLoading, setExpertLoading] = useState(false);
  const [expertSuccess, setExpertSuccess] = useState<string | null>(null);
  const [expertError, setExpertError] = useState<string | null>(null);

  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuotePolicy, setSelectedQuotePolicy] = useState<InsurancePolicy | null>(null);

  // Mock data - replace with API call
  const mockCompanies: InsuranceCompany[] = [
    {
      id: '1',
      name: 'AAR Insurance',
      logo: '🏥',
      rating: 4.8,
      description: 'Leading healthcare insurance provider with comprehensive coverage options.',
      contactInfo: {
        phone: '+254 700 123 456',
        email: 'info@aar.co.ke',
        website: 'www.aar.co.ke'
      },
      features: ['24/7 Support', 'Cashless Hospitals', 'Global Coverage', 'Maternity Cover'],
      policies: [
        {
          id: '1a',
          name: 'AAR Basic',
          tier: 'msingi',
          premium: 500,
          coverage: 50000,
          deductible: 2000,
          features: ['Inpatient Care', 'Outpatient Care', 'Emergency Services'],
          waitingPeriod: 30,
          maxAge: 65
        },
        {
          id: '1b',
          name: 'AAR Premium',
          tier: 'juu',
          premium: 3000,
          coverage: 300000,
          deductible: 1000,
          features: ['Inpatient Care', 'Outpatient Care', 'Emergency Services', 'Dental Care', 'Vision Care'],
          waitingPeriod: 15,
          maxAge: 70
        }
      ]
    },
    {
      id: '2',
      name: 'Jubilee Insurance',
      logo: '🛡️',
      rating: 4.6,
      description: 'Trusted insurance partner with extensive network of healthcare providers.',
      contactInfo: {
        phone: '+254 700 234 567',
        email: 'health@jubilee.co.ke',
        website: 'www.jubilee.co.ke'
      },
      features: ['Network Hospitals', 'Telemedicine', 'Wellness Programs', 'Family Plans'],
      policies: [
        {
          id: '2a',
          name: 'Jubilee Family',
          tier: 'familia',
          premium: 2500,
          coverage: 200000,
          deductible: 1500,
          features: ['Family Coverage', 'Maternity Care', 'Child Care', 'Preventive Care'],
          waitingPeriod: 20,
          maxAge: 75
        }
      ]
    },
    {
      id: '3',
      name: 'CIC Insurance',
      logo: '💊',
      rating: 4.4,
      description: 'Comprehensive health insurance solutions for individuals and families.',
      contactInfo: {
        phone: '+254 700 345 678',
        email: 'health@cic.co.ke',
        website: 'www.cic.co.ke'
      },
      features: ['Pharmacy Benefits', 'Lab Services', 'Specialist Care', 'Rehabilitation'],
      policies: [
        {
          id: '3a',
          name: 'CIC Standard',
          tier: 'kati',
          premium: 1500,
          coverage: 150000,
          deductible: 2500,
          features: ['Inpatient Care', 'Outpatient Care', 'Lab Tests', 'Medication'],
          waitingPeriod: 45,
          maxAge: 60
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCompanies(mockCompanies);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredCompanies = companies.filter(company => {
    if (selectedCompany !== 'all' && company.id !== selectedCompany) return false;
    if (selectedTier !== 'all') {
      return company.policies.some(policy => policy.tier === selectedTier);
    }
    return true;
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'premium':
        const aMinPremium = Math.min(...a.policies.map(p => p.premium));
        const bMinPremium = Math.min(...b.policies.map(p => p.premium));
        return aMinPremium - bMinPremium;
      default:
        return 0;
    }
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'msingi': return 'bg-green-100 text-green-800';
      case 'kati': return 'bg-blue-100 text-blue-800';
      case 'juu': return 'bg-purple-100 text-purple-800';
      case 'familia': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'msingi': return 'Basic';
      case 'kati': return 'Standard';
      case 'juu': return 'Premium';
      case 'familia': return 'Family';
      default: return tier;
    }
  };

  // Speak to an Expert handlers
  const handleExpertInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setExpertForm({ ...expertForm, [e.target.name]: e.target.value });
  };
  const handleExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpertLoading(true);
    setExpertSuccess(null);
    setExpertError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('/api/v1/insurance/expert-request', expertForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpertSuccess(res.data.message || 'Request sent!');
      setExpertForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setExpertError(err.response?.data?.error || 'Failed to send request.');
    }
    setExpertLoading(false);
  };

  // Compare Plans handlers
  const handlePolicySelect = (policyId: string) => {
    setSelectedPolicies(prev => prev.includes(policyId)
      ? prev.filter(id => id !== policyId)
      : [...prev, policyId]);
  };
  const handleCompare = async () => {
    setCompareLoading(true);
    setCompareError(null);
    setCompareResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('/api/v1/insurance/compare', { policyIds: selectedPolicies }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompareResult(res.data.data);
      setShowCompareModal(true);
    } catch (err: any) {
      setCompareError(err.response?.data?.error || 'Failed to compare plans.');
    }
    setCompareLoading(false);
  };

  const handleGetQuote = (policy: InsurancePolicy) => {
    setSelectedQuotePolicy(policy);
    setShowQuoteModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insurance marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Insurance Marketplace
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Compare and choose the best health insurance plans from leading providers in Kenya.
              Find coverage that fits your needs and budget.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tiers</option>
                <option value="msingi">Basic</option>
                <option value="kati">Standard</option>
                <option value="juu">Premium</option>
                <option value="familia">Family</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Company
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="name">Name</option>
                <option value="premium">Lowest Premium</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid with policy selection checkboxes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCompanies.map(company => (
            <div key={company.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Company Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{company.logo}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < Math.floor(company.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({company.rating})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{company.description}</p>
              </div>

              {/* Policies */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Available Plans</h4>
                <div className="space-y-4">
                  {company.policies.map(policy => (
                    <div key={policy.id} className="border rounded-lg p-4 hover:bg-gray-50 flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3"
                        checked={selectedPolicies.includes(policy.id)}
                        onChange={() => handlePolicySelect(policy.id)}
                        aria-label={`Select ${policy.name} for comparison`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{policy.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(policy.tier)}`}>{getTierLabel(policy.tier)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Monthly Premium</p>
                            <p className="font-semibold text-green-600">KES {policy.premium.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Coverage Limit</p>
                            <p className="font-semibold">KES {policy.coverage.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {policy.features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{feature}</span>
                            ))}
                            {policy.features.length > 3 && (
                              <span className="text-xs text-gray-500">+{policy.features.length - 3} more</span>
                            )}
                          </div>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors" onClick={() => handleGetQuote(policy)}>
                          Get Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Company Features */}
                <div className="mt-6 pt-4 border-t">
                  <h5 className="font-medium text-gray-900 mb-2">Company Features</h5>
                  <div className="flex flex-wrap gap-1">
                    {company.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📞 {company.contactInfo.phone}</p>
                    <p>✉️ {company.contactInfo.email}</p>
                    <p>🌐 {company.contactInfo.website}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insurance plans found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more options.</p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our insurance experts are here to help you find the perfect plan for your needs.
            Get personalized recommendations and compare options side by side.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              onClick={() => setShowExpertModal(true)}
            >
              Speak to an Expert
            </button>
            <button
              className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-blue-600 transition-colors"
              onClick={handleCompare}
              disabled={selectedPolicies.length < 2 || compareLoading}
            >
              {compareLoading ? 'Comparing...' : 'Compare Plans'}
            </button>
          </div>
        </div>
      </div>

      {/* Speak to an Expert Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative">
            <button onClick={() => setShowExpertModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Speak to an Insurance Expert</h3>
            <form onSubmit={handleExpertSubmit} className="space-y-4">
              <input type="text" name="name" value={expertForm.name} onChange={handleExpertInputChange} placeholder="Your Name" className="w-full border rounded px-3 py-2" required />
              <input type="email" name="email" value={expertForm.email} onChange={handleExpertInputChange} placeholder="Your Email" className="w-full border rounded px-3 py-2" required />
              <input type="tel" name="phone" value={expertForm.phone} onChange={handleExpertInputChange} placeholder="Your Phone" className="w-full border rounded px-3 py-2" required />
              <textarea name="message" value={expertForm.message} onChange={handleExpertInputChange} placeholder="How can we help you?" className="w-full border rounded px-3 py-2" rows={3} required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors" disabled={expertLoading}>{expertLoading ? 'Sending...' : 'Send Request'}</button>
              {expertSuccess && <div className="text-green-600 text-center mt-2">{expertSuccess}</div>}
              {expertError && <div className="text-red-600 text-center mt-2">{expertError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Compare Plans Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 relative">
            <button onClick={() => setShowCompareModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Plan Comparison</h3>
            {compareError && <div className="text-red-600 mb-2">{compareError}</div>}
            {compareResult && (
              <>
                <div className="mb-2 text-gray-700">{compareResult.summary}</div>
                <table className="w-full border rounded">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 border">Policy ID</th>
                      <th className="p-2 border">Score</th>
                      <th className="p-2 border">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareResult.details.map((row: any) => (
                      <tr key={row.policyId}>
                        <td className="p-2 border">{row.policyId}</td>
                        <td className="p-2 border">{row.score}</td>
                        <td className="p-2 border">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      {showQuoteModal && selectedQuotePolicy && (
        <QuoteRequestModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          policy={selectedQuotePolicy}
        />
      )}
    </div>
  );
};

export default InsuranceMarketplacePage; 