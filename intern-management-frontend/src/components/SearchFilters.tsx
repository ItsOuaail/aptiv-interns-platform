import { useRouter } from 'next/navigation';
import FileDropzone from './FileDropzone';

const SearchFilters = ({ 
  search, 
  onSearchChange, 
  onFilterChange, 
  onFileDrop 
}) => {
  const router = useRouter();

  const handleCreate = () => router.push('/interns/new');

  return (
    <div className="relative bg-gray-950 shadow-xl border border-orange-500/50 rounded-2xl p-8 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-2xl"></div>
      <div className="relative">
        <h2 className="text-2xl font-semibold text-white mb-6">Search & Filters</h2>
        
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search interns by name, university, or department..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">University</label>
              <input
                type="text"
                placeholder="Filter by university"
                onChange={(e) => onFilterChange('university', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">Start Date</label>
              <input
                type="date"
                onChange={(e) => onFilterChange('startDateFrom', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">Department</label>
              <input
                type="text"
                placeholder="Filter by department"
                onChange={(e) => onFilterChange('department', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCreate}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="flex-1">
              <FileDropzone onDrop={onFileDrop} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;