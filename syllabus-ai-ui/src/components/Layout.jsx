// components/Layout.jsx
import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Upload, MessageSquare, Menu, X, BookOpen } from "lucide-react";

export default function Layout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: "Home", path: "/", icon: Home },
        { name: "Upload", path: "/upload", icon: Upload },
        { name: "Ask Question", path: "/ask", icon: MessageSquare },
    ];

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <NavLink to="/" className="flex items-center gap-3 group">
                            <div className="p-2 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                    Syllabus AI
                                </h1>
                                <p className="text-xs text-gray-500">Multi-Modal Learning</p>
                            </div>
                        </NavLink>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${active
                                                ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md"
                                                : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                );
                            })}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-primary-100 bg-white/95 backdrop-blur-md animate-slide-down">
                        <div className="px-4 py-3 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${active
                                                ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md"
                                                : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content - This is where child routes render */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white/50 backdrop-blur-sm border-t border-primary-100 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            © 2026 Syllabus AI. Powered by Multi-Modal Learning.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                Terms
                            </a>
                            <a
                                href="#"
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}