'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Plus, RefreshCw } from 'lucide-react';
import api from '../../../../lib/api';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';

export default function AcademicLevelsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);

  const load = () => api.get('/academic/levels').then((r) => setLevels(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSeeding(true);
    try {
      await api.post('/academic/levels/seed');
      load();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Levels</h1>
          <p className="text-gray-500">Uganda curriculum: Nursery, Primary, O-Level, A-Level</p>
        </div>
        <Button onClick={seed} loading={seeding} variant="secondary">
          <RefreshCw className="h-4 w-4" /> Seed Default Levels
        </Button>
      </div>

      <Card>
        {levels.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <GraduationCap className="h-16 w-16 text-gray-200" />
            <div>
              <p className="text-gray-500">No academic levels defined yet</p>
              <p className="text-sm text-gray-400">Click &quot;Seed Default Levels&quot; to populate Uganda&apos;s full curriculum</p>
            </div>
            <Button onClick={seed} loading={seeding}>
              <RefreshCw className="h-4 w-4" /> Seed Default Levels
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {levels.map((level) => (
              <div key={level.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                  {level.code}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{level.name}</p>
                  <p className="text-xs text-gray-400">Order: {level.order}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
