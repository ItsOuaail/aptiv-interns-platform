import { Intern } from '../types';

interface DataTableProps {
  interns: Intern[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSendMessage: (id: number) => void;
}

const DataTable = ({ interns, onEdit, onDelete, onSendMessage }: DataTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
        <thead className="bg-gray-900/50 text-gray-300">
          <tr>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">ID</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">First Name</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Last Name</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Email</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Phone</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">University</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Major</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Start Date</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">End Date</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Supervisor</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Department</th>
            <th className="p-4 text-left text-sm font-medium uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {interns.map((intern, index) => (
            <tr
              key={intern.id}
              className={`border-t border-gray-700 hover:bg-gray-700/50 transition-all duration-300 ${
                index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'
              }`}
            >
              <td className="p-4 text-white">{intern.id}</td>
              <td className="p-4 text-white">{intern.firstName}</td>
              <td className="p-4 text-white">{intern.lastName}</td>
              <td className="p-4 text-white">{intern.email}</td>
              <td className="p-4 text-white">{intern.phone}</td>
              <td className="p-4 text-white">{intern.university}</td>
              <td className="p-4 text-white">{intern.major}</td>
              <td className="p-4 text-white">{intern.startDate}</td>
              <td className="p-4 text-white">{intern.endDate}</td>
              <td className="p-4 text-white">{intern.supervisor}</td>
              <td className="p-4 text-white">{intern.department}</td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(intern.id)}
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(intern.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1zm-5 4h14" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onSendMessage(intern.id)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;