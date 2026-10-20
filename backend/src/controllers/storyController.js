const Story = require('../models/Story');
const StoryView = require('../models/StoryView');
const User = require('../models/User');

exports.createStory = async (req, res) => {
  try {
    const { image, caption } = req.body;
    if (!image) return res.status(400).json({ message: 'Image is required for story' });

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = new Story({
      user: req.user._id,
      image,
      caption: caption || '',
      expiresAt
    });

    await story.save();
    await story.populate('user', 'username name profilePicture');
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
};

exports.getActiveStories = async (req, res) => {
  try {
    const now = new Date();
    
    // Fetch only stories from self and followed users
    const currentUser = await User.findById(req.user._id);
    const allowedIds = [req.user._id, ...(currentUser?.following || [])];

    const stories = await Story.find({ 
      user: { $in: allowedIds },
      expiresAt: { $gt: now } 
    }).populate('user', 'username name profilePicture').sort({ createdAt: 1 });

    const storyIds = stories.map(s => s._id);
    const views = await StoryView.find({
      story: { $in: storyIds },
      viewer: req.user._id
    });
    
    const viewedStoryIds = new Set(views.map(v => v.story.toString()));

    const grouped = {};
    for (const story of stories) {
      if (!story.user) continue;
      const userId = story.user._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.user,
          stories: []
        };
      }
      grouped[userId].stories.push({
        ...story.toObject(),
        isViewed: viewedStoryIds.has(story._id.toString())
      });
    }

    const result = [];
    const myId = req.user._id.toString();
    
    let myStoryGroup = null;
    const unseenGroups = [];
    const seenGroups = [];

    for (const userId in grouped) {
      const group = grouped[userId];
      const hasUnseen = group.stories.some(s => !s.isViewed);
      group.allViewed = !hasUnseen;
      
      if (userId === myId) {
        myStoryGroup = group;
      } else if (hasUnseen) {
        unseenGroups.push(group);
      } else {
        seenGroups.push(group);
      }
    }
    
    if (myStoryGroup) result.push(myStoryGroup);
    result.push(...unseenGroups);
    result.push(...seenGroups);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
};

exports.viewStory = async (req, res) => {
  try {
    const existing = await StoryView.findOne({ story: req.params.id, viewer: req.user._id });
    if (!existing) {
      await StoryView.create({ story: req.params.id, viewer: req.user._id });
    }
    res.json({ message: 'Story viewed' });
  } catch (error) {
    res.status(500).json({ message: 'Error viewing story', error: error.message });
  }
};

exports.getStoryViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view viewers of this story' });
    }

    const viewers = await StoryView.find({ story: req.params.id })
      .populate('viewer', 'name username profilePicture')
      .sort({ createdAt: -1 });

    res.json(viewers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story viewers', error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    await StoryView.deleteMany({ story: req.params.id });
    res.json({ message: 'Story removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
};
