import { Intern } from '../types';

interface DataTableProps {
  interns: Intern[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSendMessage: (id: number) => void;
  selectedInternIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (select: boolean) => void;
}

const DataTable = ({ interns, onEdit, onDelete, onSendMessage, selectedInternIds, onToggleSelect, onSelectAll }: DataTableProps) => {
  if (interns.length === 0) {
    return (
      <div className="bg-gray-600/50 backdrop-blur-sm border border-gray-500 rounded-2xl p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-500/50 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Interns Found</h3>
        <p className="text-gray-200">No interns match your current search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-600/30 backdrop-blur-sm border border-gray-500 rounded-2xl">
            <thead className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={interns.length > 0 && interns.every(intern => selectedInternIds.includes(intern.id))}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  University
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Major
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Supervisor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Department
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500/50">
              {interns.map((intern, index) => (
                <tr
                  key={intern.id}
                  className={`hover:bg-gray-500/30 transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-gray-600/20' : 'bg-gray-600/40'
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedInternIds.includes(intern.id)}
                      onChange={() => onToggleSelect(intern.id)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-400">#{intern.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{intern.firstName} {intern.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-200">{intern.email}</div>
                    <div className="text-sm text-gray-300">{intern.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{intern.university}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {intern.major}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-200">{intern.startDate}</div>
                    <div className="text-sm text-gray-300">{intern.endDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{intern.supervisor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      {intern.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(intern.id)}
                        className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all duration-300 transform hover:scale-105 border border-orange-500/30 hover:border-orange-500/50"
                        title="Edit Intern"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onSendMessage(intern.id)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300 transform hover:scale-105 border border-green-500/30 hover:border-green-500/50"
                        title="Send Message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(intern.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 transform hover:scale-105 border border-red-500/30 hover:border-red-500/50"
                        title="Delete Intern"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1zm-5 4h14" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="xl:hidden space-y-4">
        {interns.map((intern, index) => (
          <div
            key={intern.id}
            className="bg-gray-600/50 backdrop-blur-sm border border-gray-500 rounded-2xl p-6 hover:bg-gray-600/70 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedInternIds.includes(intern.id)}
                  onChange={() => onToggleSelect(intern.id)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-400">#{intern.id}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{intern.firstName} {intern.lastName}</h3>
                  <p className="text-sm text-gray-200">{intern.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(intern.id)}
                  className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all duration-300 border border-orange-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onSendMessage(intern.id)}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300 border border-green-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(intern.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 border border-red-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1zm-5 4h14" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">Phone</p>
                <p className="text-sm text-white">{intern.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">University</p>
                <p className="text-sm text-white">{intern.university}</p>
              </div>
              <div>
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">Major</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {intern.major}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">Department</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-blue-500/30">
                  {intern.department}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">Start Date</p>
                <p className="text-sm text-white">{intern.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">End Date</p>
                <p className="text-sm text-white">{intern.endDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-200 uppercase tracking-wide font-medium mb-1">Supervisor</p>
                <p className="text-sm text-white">{intern.supervisor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;