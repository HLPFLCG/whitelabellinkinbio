'use client';

import { useState } from 'react';
import { Link } from '@/lib/types/database';
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import LinkForm from './LinkForm';

interface Props {
  initialLinks: Link[];
}

export default function LinkManager({ initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const handleAddLink = async (data: Partial<Link>) => {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const newLink = await response.json();
      setLinks([...links, newLink]);
      setIsAdding(false);
    }
  };

  const handleUpdateLink = async (id: string, data: Partial<Link>) => {
    const response = await fetch(`/api/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedLink = await response.json();
      setLinks(links.map(link => link.id === id ? updatedLink : link));
      setEditingLink(null);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    const response = await fetch(`/api/links/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setLinks(links.filter(link => link.id !== id));
    }
  };

  const handleToggleActive = async (link: Link) => {
    await handleUpdateLink(link.id, { is_active: !link.is_active });
  };

  return (
    <div className="space-y-4">
      {/* Add Link Button */}
      {!isAdding && !editingLink && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2 group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add New Link</span>
        </button>
      )}

      {/* Add Link Form */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Link</h3>
          <LinkForm
            onSubmit={handleAddLink}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No links yet</p>
            <p className="text-sm mt-1">Click the button above to add your first link</p>
          </div>
        )}
        
        {links.map((link) => (
          <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {editingLink?.id === link.id ? (
              <LinkForm
                initialData={link}
                onSubmit={(data) => handleUpdateLink(link.id, data)}
                onCancel={() => setEditingLink(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{link.title}</h4>
                      {!link.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{link.url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(link)}
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    title={link.is_active ? 'Hide link' : 'Show link'}
                  >
                    {link.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingLink(link)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}