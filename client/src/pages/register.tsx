import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/sidebar";
import Register from "@/components/auth/Register";
import LiveStats from "@/components/auth/LiveStats";
import NotificationRequest from "@/components/common/NotificationRequest";
import logoWithText from "@/assets/ethervox-globe-with-text.svg";
import { 
  Zap, 
  BadgeCheck, 
  TrendingUp, 
  Headphones, 
  ShieldCheck, 
  Sparkles, 
  CircleDollarSign,
  Lock,
  Smartphone,
  Users,
  Globe2,
  MessageSquare,
  Star,
  Instagram, 
  Facebook,
  Twitter,
  ThumbsUp
} from "lucide-react";

const RegisterPage: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  // Platform benefits
  const benefits = [
    { title: "Premium Numbers", description: "Access to exclusive virtual numbers from 90+ countries", icon: Smartphone },
    { title: "Instant Activation", description: "Numbers are delivered and activated within minutes", icon: Zap },
    { title: "Earn With Referrals", description: "Get ₦100 for each user you refer to our platform", icon: CircleDollarSign },
    { title: "24/7 Support", description: "Get help anytime with our ETHERVOX AI assistant", icon: Headphones },
  ];

  // Platform stats for trust signals
  const stats = [
    { label: "Active Users", value: "12,451+", icon: Users },
    { label: "Global Reach", value: "90+ Countries", icon: Globe2 },
    { label: "Success Rate", value: "98%", icon: BadgeCheck },
  ];

  return (
    <div className="min-h-screen flex font-sans antialiased">
      <Sidebar isOpen={false} onClose={() => {}} />
      
      <div className="flex-1 overflow-hidden phone-texture-bg">
        <div className="overflow-auto h-screen">
          <div className="container mx-auto px-4 py-6">
            {/* Site Logo - First Element */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img 
                  src={logoWithText} 
                  alt="ETHERVOX SMS" 
                  className="h-28 md:h-44 transition-all duration-300 hover:scale-105 drop-shadow-lg filter brightness-110" 
                />
              </div>
              <p className="text-xs text-purple-300 mb-4 tracking-widest uppercase font-light drop-shadow-md italic">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">
                  Connecting the world, one number at a time
                </span>
              </p>
              <div className="flex justify-center">
                <NotificationRequest />
              </div>
            </div>
            
            {/* Live Stats - Dynamic Component */}
            <LiveStats />
            
            {/* Trust Signals - Second Element */}
            <div className="glowing-card p-4 mb-10 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-3 rainbow-text text-center">Platform Statistics</h3>
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="stats-circle-vibrant w-20 h-20 mx-auto mb-2" style={{ "--percentage": "95%" } as React.CSSProperties}>
                      <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-white font-bold stats-value text-lg">{stat.value}</h3>
                    <p className="text-purple-300 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Register Form */}
              <div className="md:order-2">
                <div className="max-w-md mx-auto">
                  <Register />
                </div>
              </div>
              
              {/* Hero Content */}
              <div className="md:order-1 space-y-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    <span className="neon-text">Join Our Platform</span>
                  </h2>
                  <p className="text-lg text-purple-300 mb-6">Create your account and get instant access to premium virtual numbers with our reward program.</p>
                </div>
                
                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="vibrant-card p-4 floating" style={{ animationDelay: `${index * 0.2}s` }}>
                      <div className="flex gap-3 items-start">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-2 rounded-lg">
                          <benefit.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-1">{benefit.title}</h3>
                          <p className="text-gray-300 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Feature Badges */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="bg-purple-900/30 text-purple-300 text-xs font-medium px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Privacy Protected
                  </span>
                  <span className="bg-blue-900/30 text-blue-300 text-xs font-medium px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Premium Quality
                  </span>
                  <span className="bg-indigo-900/30 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Encrypted Data
                  </span>
                  <span className="bg-fuchsia-900/30 text-fuchsia-300 text-xs font-medium px-3 py-1 rounded-full border border-fuchsia-500/30 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Growing Fast
                  </span>
                </div>
              </div>
            </div>
            
            {/* Testimonials at the bottom */}
            <div className="mt-20 mb-8">
              <h3 className="text-xl font-bold mb-4 rainbow-text text-center">Customer Testimonials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Instagram Testimonial */}
                <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-5 rounded-xl border border-purple-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                    <Instagram className="h-3 w-3 inline mr-1" /> Instagram
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-white">John Doe</p>
                      <div className="flex text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">"ETHERVOX SMS has been a game changer for my business. The virtual numbers are reliable and their referral program is amazing! #EtherVoxRocks"</p>
                  <div className="text-purple-400 text-xs flex gap-2">
                    <span className="flex items-center"><ThumbsUp className="h-3 w-3 mr-1" /> 1.2k</span>
                    <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" /> 67</span>
                  </div>
                </div>
                
                {/* Facebook Testimonial */}
                <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-5 rounded-xl border border-blue-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs px-3 py-1 rounded-bl-lg">
                    <Facebook className="h-3 w-3 inline mr-1" /> Facebook
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      SM
                    </div>
                    <div>
                      <p className="font-medium text-white">Sarah Miller</p>
                      <div className="flex text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">"I've been using ETHERVOX for 6 months now and couldn't be happier. The customer service is top-notch and the platform is super easy to use."</p>
                  <div className="text-blue-400 text-xs flex gap-2">
                    <span className="flex items-center"><ThumbsUp className="h-3 w-3 mr-1" /> 856</span>
                    <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" /> 42</span>
                  </div>
                </div>
                
                {/* Twitter Testimonial */}
                <div className="bg-gradient-to-br from-sky-900/50 to-blue-900/50 p-5 rounded-xl border border-sky-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-sky-500 to-blue-400 text-white text-xs px-3 py-1 rounded-bl-lg">
                    <Twitter className="h-3 w-3 inline mr-1" /> Twitter
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      RJ
                    </div>
                    <div>
                      <p className="font-medium text-white">Robert Johnson</p>
                      <div className="flex text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">"Just earned my 20th referral bonus from @ETHERVOX_SMS! This platform is the real deal. Helping friends get virtual numbers while making money is a win-win! 🚀"</p>
                  <div className="text-sky-400 text-xs flex gap-2">
                    <span className="flex items-center"><ThumbsUp className="h-3 w-3 mr-1" /> 2.5k</span>
                    <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" /> 148</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
