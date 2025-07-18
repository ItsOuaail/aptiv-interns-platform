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
      <table className="min-w-full bg-white border">
        <thead className="bg-dark-blue text-white">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">First Name</th>
            <th className="p-2">Last Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
            <th className="p-2">University</th>
            <th className="p-2">Major</th>
            <th className="p-2">Start Date</th>
            <th className="p-2">End Date</th>
            <th className="p-2">Supervisor</th>
            <th className="p-2">Department</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {interns.map((intern) => (
            <tr key={intern.id} className="border-t">
              <td className="p-2">{intern.id}</td>
              <td className="p-2">{intern.firstName}</td>
              <td className="p-2">{intern.lastName}</td>
              <td className="p-2">{intern.email}</td>
              <td className="p-2">{intern.phone}</td>
              <td className="p-2">{intern.university}</td>
              <td className="p-2">{intern.major}</td>
              <td className="p-2">{intern.startDate}</td>
              <td className="p-2">{intern.endDate}</td>
              <td className="p-2">{intern.supervisor}</td>
              <td className="p-2">{intern.department}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => onEdit(intern.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(intern.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => onSendMessage(intern.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
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