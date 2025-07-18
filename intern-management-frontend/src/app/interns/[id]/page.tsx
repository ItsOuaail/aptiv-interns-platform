"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { updateIntern } from '../../../services/internService';
import Navbar from '../../../components/Navbar';
import api from '../../../services/api';

const EditInternPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id; // Get the id from useParams instead of router.query
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    startDate: '',
    endDate: '',
    supervisor: '',
    department: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['intern', id],
    queryFn: () => api.get(`/interns/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      setFormData(data.data);
    }
  }, [data]);

  if (!token || isLoading) return <div className="text-center p-4">Loading...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: string[] = [];
    if (!formData.firstName) newErrors.push('First name is required');
    if (!formData.lastName) newErrors.push('Last name is required');
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.push('Valid email is required');
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.push('End date must be after start date');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateIntern(Number(id), formData);
      router.push('/dashboard');
    } catch (err) {
      alert('Error updating intern');
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-dark-blue">Edit Intern {id}</h1>
        <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
          <div className="space-y-4">
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-2 border rounded" />
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-2 border rounded" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
            <input name="university" value={formData.university} onChange={handleChange} placeholder="University" className="w-full p-2 border rounded" />
            <input name="major" value={formData.major} onChange={handleChange} placeholder="Major" className="w-full p-2 border rounded" />
            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="w-full p-2 border rounded" />
            <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" className="w-full p-2 border rounded" />
            {errors.length > 0 && (
              <ul className="text-red-500">
                {errors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            )}
            <button onClick={handleSubmit} className="w-full bg-dark-blue text-white p-2 rounded hover:bg-blue-800">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInternPage;