import { useRouter } from 'next/navigation';

const HeroSection = ({ 
  totalInterns, 
  activeInterns, 
  upcomingEndDates, 
  viewMode, 
  setViewMode,
  successMessage,
  errorMessage 
}) => {
  const router = useRouter();

  const handleViewChange = (mode) => {
    setViewMode(mode);
    router.push(`/dashboard?view=${mode}#table`);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 to-blue-300/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Intern Management
            <span className="text-orange-500 ml-2">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Streamline your internship program with advanced analytics and seamless management tools
          </p>
        </div>

        {successMessage && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500 rounded-2xl text-center text-green-500 font-medium animate-fade-in">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-2xl text-center text-red-500 font-medium animate-fade-in">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div 
            className={`bg-gray-950 backdrop-blur-sm border ${viewMode === 'all' ? 'border-orange-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300 cursor-pointer`}
            onClick={() => handleViewChange('all')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Total Interns</p>
                <p className="text-4xl font-bold text-white mt-2">{totalInterns?.data || 0}</p>
              </div>
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className={`bg-gray-950 backdrop-blur-sm border ${viewMode === 'active' ? 'border-green-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300 cursor-pointer`}
            onClick={() => handleViewChange('active')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Active Interns</p>
                <p className="text-4xl font-bold text-white mt-2">{activeInterns?.data || 0}</p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className={`bg-gray-950 backdrop-blur-sm border ${viewMode === 'upcoming' ? 'border-blue-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300 cursor-pointer`}
            onClick={() => handleViewChange('upcoming')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Upcoming End Dates</p>
                <p className="text-4xl font-bold text-white mt-2">{upcomingEndDates?.data || 0}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;