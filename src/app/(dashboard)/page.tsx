'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetPatients } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    apiGetPatients().then(patients => {
      if (patients && patients.length > 0) router.replace('/patient/' + patients[0].id);
    }).catch(console.error);
  }, [router]);
  return <div className='flex items-center justify-center h-full text-slate-400 text-sm'>Carregando...</div>;
}
