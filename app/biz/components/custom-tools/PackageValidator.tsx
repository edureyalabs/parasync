// app/biz/components/custom-tools/PackageValidator.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, Check, Package, Search } from 'lucide-react';

interface PackageValidatorProps {
  code: string;
  selectedPackages: string[];
  onChange: (packages: string[]) => void;
}

interface ApprovedPackage {
  id: string;
  package_name: string;
  version: string | null;
  category: string | null;
  description: string | null;
}

export default function PackageValidator({ code, selectedPackages, onChange }: PackageValidatorProps) {
  const supabase = createClient();
  const [approvedPackages, setApprovedPackages] = useState<ApprovedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [detectedPackages, setDetectedPackages] = useState<string[]>([]);

  useEffect(() => {
    loadApprovedPackages();
  }, []);

  useEffect(() => {
    detectImports();
  }, [code]);

  const loadApprovedPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_packages')
        .select('*')
        .order('package_name');

      if (error) throw error;
      setApprovedPackages(data || []);
    } catch (error) {
      console.error('Error loading approved packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectImports = () => {
    const importRegex = /^(?:from|import)\s+([a-zA-Z0-9_]+)/gm;
    const matches = [...code.matchAll(importRegex)];
    const detected = matches.map(match => match[1]).filter(pkg => pkg !== 'typing');
    setDetectedPackages([...new Set(detected)]);
  };

  const togglePackage = (packageName: string) => {
    if (selectedPackages.includes(packageName)) {
      onChange(selectedPackages.filter(p => p !== packageName));
    } else {
      onChange([...selectedPackages, packageName]);
    }
  };

  const filteredPackages = approvedPackages.filter(pkg =>
    pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    const category = pkg.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(pkg);
    return acc;
  }, {} as Record<string, ApprovedPackage[]>);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Package className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Package Management</p>
            <p>Select packages your tool requires. Only pre-approved packages are available.</p>
          </div>
        </div>
      </div>

      {detectedPackages.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-800 mb-2">Detected Imports</p>
          <div className="flex flex-wrap gap-2">
            {detectedPackages.map(pkg => {
              const isApproved = approvedPackages.some(ap => ap.package_name === pkg);
              const isSelected = selectedPackages.includes(pkg);
              
              return (
                <div
                  key={pkg}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    isApproved
                      ? isSelected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isApproved ? (
                    <Check size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  {pkg}
                </div>
              );
            })}
          </div>
          {detectedPackages.some(pkg => !approvedPackages.some(ap => ap.package_name === pkg)) && (
            <p className="text-xs text-amber-700 mt-2">
              Some detected packages are not approved. Your tool may fail during execution.
            </p>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search packages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            {Object.keys(groupedPackages).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No packages found
              </div>
            ) : (
              Object.entries(groupedPackages).map(([category, packages]) => (
                <div key={category}>
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">
                      {category}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {packages.map(pkg => (
                      <label
                        key={pkg.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg.package_name)}
                          onChange={() => togglePackage(pkg.package_name)}
                          className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {pkg.package_name}
                            </p>
                            {pkg.version && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                                {pkg.version}
                              </span>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-1">
          Selected Packages ({selectedPackages.length})
        </p>
        {selectedPackages.length === 0 ? (
          <p className="text-xs text-gray-500">No packages selected</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedPackages.map(pkg => (
              <span key={pkg} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                {pkg}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}