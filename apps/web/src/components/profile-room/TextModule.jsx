/**
 * WYA!? — Text Module (Alpha)
 * 
 * Purpose: Display custom text content
 */

import { FileText, Edit2 } from "lucide-react";
import { useState } from "react";

export default function TextModule({ content, isOwner, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(content?.text || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdate) return;

    setSaving(true);
    try {
      await onUpdate({ text: text.trim() });
      setEditing(false);
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-[#7A5AF8]" />
          <h3 className="font-semibold text-white">Text</h3>
        </div>
        {isOwner && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[#8B8B90] hover:text-white"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
            rows={4}
            placeholder="Enter text content..."
            maxLength={2000}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#7A5AF8] text-white px-3 py-1 rounded text-sm hover:bg-[#6D4CE5] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setText(content?.text || "");
                setEditing(false);
              }}
              className="bg-[#27272A] text-white px-3 py-1 rounded text-sm hover:bg-[#3A3A3D] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-[#D4D4D8] whitespace-pre-wrap break-words">
          {content?.text || "No content yet"}
        </div>
      )}
    </div>
  );
}

