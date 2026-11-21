const storeAdapter = require('../config/storeAdapter');

exports.getNotes = async (req, res) => {
  try {
    const notes = await storeAdapter.getNotes(req.user.id, req.query);
    
    // Extract unique tags across all user notes for tag filtering UI
    const allNotes = await storeAdapter.getNotes(req.user.id, {});
    const tagsSet = new Set();
    allNotes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    res.status(200).json({
      success: true,
      count: notes.length,
      availableTags: Array.from(tagsSet),
      data: notes,
    });
  } catch (err) {
    console.error('getNotes error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes.',
      error: err.message,
    });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned, color } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required.',
      });
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => t.trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newNote = await storeAdapter.createNote(req.user.id, {
      title: title.trim(),
      content: content || '',
      tags: cleanTags,
      isPinned: Boolean(isPinned),
      color: color || 'default',
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: newNote,
    });
  } catch (err) {
    console.error('createNote error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create note.',
      error: err.message,
    });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, isPinned, color } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);
    if (color !== undefined) updates.color = color;

    const updated = await storeAdapter.updateNote(id, req.user.id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('updateNote error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update note.',
      error: err.message,
    });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storeAdapter.deleteNote(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
      data: deleted,
    });
  } catch (err) {
    console.error('deleteNote error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note.',
      error: err.message,
    });
  }
};
