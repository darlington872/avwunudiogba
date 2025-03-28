import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  adminMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, adminMode = false }) => {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  // Debug sidebar state
  useEffect(() => {
    console.log("Sidebar received isOpen state:", isOpen);
  }, [isOpen]);

  const isActive = (path: string) => {
    return location === path;
  };
  
  // Navigation handler that properly closes the sidebar on mobile
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close sidebar when navigating
  };

  return (
    <>
      {/* Backdrop overlay for mobile - only shows when sidebar is open */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={`bg-black text-white w-64 py-4 flex flex-col transition-all duration-300 transform fixed md:static inset-y-0 left-0 z-50 md:translate-x-0 shadow-xl border-r border-purple-600/40 backdrop-blur-md bg-opacity-80 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ height: '100vh' }}
      >
        {/* Glassmorphic effect elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        
        {/* Content with relative position to be above the effects */}
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between px-4 mb-6">
            <div className="flex items-center">
              <img 
                src="/src/assets/ethervox-logo.svg" 
                alt="Ethervox SMS" 
                className="h-8" 
              />
            </div>
            <button
              onClick={onClose}
              type="button"
              aria-label="Close menu"
              className="md:hidden text-white hover:text-purple-400 transition-colors p-2 bg-purple-900/20 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {user ? (
            <>
              <p className="px-4 text-xs text-gray-400 mb-2 mt-2">USER MENU</p>
              <nav className="flex-1">
                <div
                  onClick={() => handleNavigation("/dashboard")}
                  className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/dashboard") || isActive("/") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
                <div
                  onClick={() => handleNavigation("/referrals")}
                  className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/referrals") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>Referrals</span>
                </div>
                <div
                  onClick={() => handleNavigation("/store")}
                  className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/store") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <span>Buy Numbers</span>
                </div>
                <div
                  onClick={() => handleNavigation("/kyc")}
                  className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/kyc") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>KYC Verification</span>
                </div>
              </nav>
              
              {user.isAdmin && (
                <>
                  <p className="px-4 text-xs text-gray-400 mb-2 mt-6">ADMIN CONTROLS</p>
                  <nav className="flex-1">
                    <div
                      onClick={() => handleNavigation("/admin")}
                      className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/admin") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      <span>Admin Dashboard</span>
                    </div>
                    <div
                      onClick={() => handleNavigation("/admin/stock")}
                      className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/admin/stock") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span>Stock Management</span>
                    </div>
                    <div
                      onClick={() => handleNavigation("/admin/users")}
                      className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/admin/users") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5 5 0 00-1.5-3.5A5 5 0 0013 16v1h3zM6 15v-1a4 4 0 00-3.5-3.9A5 5 0 000 15v1h6z" />
                      </svg>
                      <span>User Management</span>
                    </div>
                    <div
                      onClick={() => handleNavigation("/admin/payments")}
                      className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/admin/payments") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      <span>Payment Verification</span>
                    </div>
                    <div
                      onClick={() => handleNavigation("/admin/broadcast")}
                      className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/admin/broadcast") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                      </svg>
                      <span>Broadcast Message</span>
                    </div>
                    <div
                      onClick={() => handleNavigation("/admin/settings")}
                      className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/admin/settings") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      <span>System Settings</span>
                    </div>
                  </nav>
                </>
              )}
            </>
          ) : (
            <>
              <p className="px-4 text-xs text-gray-400 mb-2 mt-2">ACCOUNT</p>
              <nav className="flex-1">
                <div
                  onClick={() => handleNavigation("/login")}
                  className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/login") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Login</span>
                </div>
                <div
                  onClick={() => handleNavigation("/register")}
                  className={`flex items-center px-4 py-3 text-white cursor-pointer ${isActive("/register") ? "bg-gradient-to-r from-purple-900/60 to-black border-l-4 border-purple-600" : "hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-black hover:border-l-4 hover:border-purple-600"} transition-all`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  <span>Register</span>
                </div>
              </nav>
            </>
          )}

          {user && (
            <div className="mt-auto px-4 py-2">
              <div>
                <div className="flex items-center px-4 py-2 rounded-md backdrop-blur-sm bg-gradient-to-br from-purple-900/20 to-black/40 border border-purple-600/30 shadow-inner">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium vibrant-gradient-text">{user.fullName}</p>
                    <p className="text-xs text-purple-300">Balance: <span className="rainbow-text font-bold">₦{user.balance.toFixed(2)}</span></p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-center block w-full mt-2 text-purple-400 hover:text-purple-300 transition-colors duration-200 backdrop-blur-sm py-1 rounded-md bg-purple-800/10 border border-purple-800/20 hover:bg-purple-800/20"
                >
                  Logout{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;