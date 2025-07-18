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
              <td className="p-4 space-x-3">
                <button
                  onClick={() => onEdit(intern.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(intern.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Delete
                </button>
                <button
                  onClick={() => onSendMessage(intern.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Message
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;