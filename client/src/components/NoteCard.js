"use client"

const NoteCard = ({ note, onEdit, onDelete, onToggleArchive }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{note.title}</h3>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={() => onEdit(note)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit note"
          >
            ✏️
          </button>
          <button
            onClick={() => onToggleArchive(note._id)}
            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
            title={note.isArchived ? "Unarchive note" : "Archive note"}
          >
            {note.isArchived ? "📤" : "🗃️"}
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created {formatDate(note.createdAt)}</span>
        {note.isArchived && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Archived</span>}
      </div>
    </div>
  )
}

export default NoteCard
