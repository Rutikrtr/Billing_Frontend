import React from 'react';
import { 
  Phone, 
  Mail, 
  ExternalLink, 
  Globe, 
  MessageCircle, 
  HelpCircle,
  FileText,
  Zap,
  Users,
  Shield,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';

const Support = () => {
  const websites = [
    {
      title: "rutikrtr.online",
      url: "https://rutikrtr.online/",
      description: "Main portfolio website showcasing our work and services",
      icon: <Globe className="w-5 h-5" />
    },
    {
      title: "TechyVerve",
      url: "https://www.techyverve.in/",
      description: "Technology solutions and digital services platform",
      icon: <Zap className="w-5 h-5" />
    },
    {
      title: "rutikrtr.framer.ai",
      url: "https://rutikrtr.framer.ai/",
      description: "Interactive portfolio built with Framer",
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const supportFeatures = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Get help whenever you need it with our round-the-clock assistance"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Team",
      description: "Skilled professionals with years of experience ready to assist"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  const softwareFeatures = [
    "Vehicle & Client Management",
    "Automated Billing & Invoicing", 
    "Expense Tracking & Reports",
    "Fuel Management System",
    "Transaction History",
    "Overview & Analytics"
  ];

  const faqs = [
    {
      question: "How to get started with the software?",
      answer: "Contact our support team for installation and setup assistance. We provide step-by-step guidance to get you up and running."
    },
    {
      question: "Is training provided?",
      answer: "Yes, we provide comprehensive training for all software features including video tutorials and one-on-one sessions."
    },
    {
      question: "What about data backup and security?",
      answer: "We provide secure data backup solutions and enterprise-grade security to protect your business information."
    },
    {
      question: "How often are software updates released?",
      answer: "Regular updates are provided with new features, bug fixes, and performance improvements based on user feedback."
    }
  ];

  const supportContacts = [
    {
      name: "Shree Shingote",
      phone: "+917276156939",
      role: "Director"
    },
    {
      name: "Rutik Shingote", 
      phone: "+919130690366",
      role: "Director"
    },
    {
      name: "Abhishek Shinde",
      phone: "+919146053881", 
      role: "Director"
    }
  ];

  const handlePhoneCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleEmailSupport = () => {
    window.open('mailto:support@rutikrtr.online?subject=Support Request - Earthmovers Billing', '_self');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Support Center
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Get the help you need for Earthmovers Billing software. Our expert team is here to assist you.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Software Information */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Earthmovers Billing Software
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete billing solution for construction businesses
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Key Features
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  {softwareFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://rutikrtr.framer.ai/work/earthmoversbilling"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              View Software Details
            </a>
          </div>

          {/* Support Features */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Why Choose Our Support?
            </h2>
            <div className="space-y-4">
              {supportFeatures.map((feature, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Direct Contact */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Get Direct Support
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Contact our support team directly
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {supportContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{contact.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePhoneCall(contact.phone)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                      Call Now
                    </button>
                  </div>
                  
                  <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {contact.phone}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Available Monday - Saturday, 9 AM - 7 PM
                    </p>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleEmailSupport}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email Support
              </button>
            </div>
          </div>

          {/* Our Websites */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Our Digital Presence
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore our websites and portfolio
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {websites.map((website, index) => (
                <a
                  key={index}
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-purple-600 group-hover:text-purple-700 transition-colors">
                        {website.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {website.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {website.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Need Immediate Assistance?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our support team is ready to help you resolve any issues quickly and efficiently.
          </p>
          <button
            onClick={() => handlePhoneCall(supportContacts[0].phone)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Contact Support Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;