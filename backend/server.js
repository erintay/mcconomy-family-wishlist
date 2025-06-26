const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'mcconomy-wishlist-data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data structure
const initialData = {
  familyMembers: [
    { id: 1, name: 'Tom', avatar: '💎' },
    { id: 2, name: 'Cherney', avatar: '🍾' },
    { id: 3, name: 'Kait', avatar: '🗺' },
    { id: 4, name: 'Alex', avatar: '✈️' },
    { id: 5, name: 'Corrie', avatar: '🥏' },
    { id: 6, name: 'Matt', avatar: '🎸' },
    { id: 7, name: 'Erin', avatar: '🪴' }
  ],
  wishlists: {
    1: [
      { id: 1, item: 'Coffee grinder', link: 'https://amazon.com/coffee-grinder', size: '', color: '', notes: 'For morning coffee routine', purchased: false },
      { id: 2, item: 'Book: The Seven Husbands of Evelyn Hugo', link: 'https://amazon.com/seven-husbands-book', size: '', color: '', notes: 'Paperback preferred', purchased: true }
    ],
    2: [
      { id: 3, item: 'Essential oils set', link: 'https://amazon.com/essential-oils', size: '', color: '', notes: 'Lavender and eucalyptus preferred', purchased: false },
      { id: 4, item: 'Cozy throw blanket', link: 'https://target.com/throw-blanket', size: 'Large', color: 'Gray or beige', notes: 'For living room couch', purchased: false }
    ],
    3: [
      { id: 5, item: 'Skincare gift set', link: 'https://sephora.com/skincare-set', size: '', color: '', notes: 'For sensitive skin', purchased: false },
      { id: 6, item: 'Workout leggings', link: 'https://lululemon.com/leggings', size: 'Medium', color: 'Black', notes: 'High-waisted style', purchased: true }
    ],
    4: [
      { id: 7, item: 'Gaming headset', link: 'https://bestbuy.com/gaming-headset', size: '', color: 'Black or red', notes: 'Wireless preferred', purchased: false },
      { id: 8, item: 'Board game', link: 'https://amazon.com/board-game', size: '', color: '', notes: 'Strategy games preferred', purchased: false }
    ],
    5: [
      { id: 9, item: 'Candle making kit', link: 'https://etsy.com/candle-kit', size: 'Beginner', color: '', notes: 'Includes wicks and instructions', purchased: false },
      { id: 10, item: 'Plant pot set', link: 'https://homedepot.com/plant-pots', size: 'Medium', color: 'Terracotta', notes: 'For indoor herbs', purchased: false }
    ],
    6: [
      { id: 11, item: 'Tool organizer', link: 'https://lowes.com/tool-organizer', size: 'Large', color: 'Black', notes: 'For garage workbench', purchased: false },
      { id: 12, item: 'Bluetooth speaker', link: 'https://bestbuy.com/bluetooth-speaker', size: 'Portable', color: '', notes: 'Waterproof for outdoor use', purchased: true }
    ],
    7: [
      { id: 13, item: 'Yoga mat', link: 'https://target.com/yoga-mat', size: 'Standard', color: 'Purple or teal', notes: 'Extra thick for comfort', purchased: false },
      { id: 14, item: 'Recipe book', link: 'https://amazon.com/recipe-book', size: '', color: '', notes: 'Vegetarian recipes preferred', purchased: false }
    ]
  }
};

// Helper functions
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with initial data
    await writeData(initialData);
    return initialData;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes

// Get all data (family members and wishlists)
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Get specific family member's wishlist
app.get('/api/wishlists/:memberId', async (req, res) => {
  try {
    const data = await readData();
    const memberId = req.params.memberId;
    const wishlist = data.wishlists[memberId] || [];
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add item to wishlist
app.post('/api/wishlists/:memberId/items', async (req, res) => {
  try {
    const data = await readData();
    const memberId = req.params.memberId;
    const { item, link, size, color, notes } = req.body;

    if (!item) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Generate new ID
    const allItems = Object.values(data.wishlists).flat();
    const maxId = allItems.length > 0 ? Math.max(...allItems.map(i => i.id)) : 0;
    const newId = maxId + 1;

    const newItem = {
      id: newId,
      item,
      link: link || '',
      size: size || '',
      color: color || '',
      notes: notes || '',
      purchased: false
    };

    // Initialize wishlist if it doesn't exist
    if (!data.wishlists[memberId]) {
      data.wishlists[memberId] = [];
    }

    data.wishlists[memberId].push(newItem);
    await writeData(data);

    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update item (toggle purchased status)
app.put('/api/wishlists/:memberId/items/:itemId', async (req, res) => {
  try {
    const data = await readData();
    const memberId = req.params.memberId;
    const itemId = parseInt(req.params.itemId);

    if (!data.wishlists[memberId]) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const itemIndex = data.wishlists[memberId].findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Toggle purchased status
    data.wishlists[memberId][itemIndex].purchased = !data.wishlists[memberId][itemIndex].purchased;
    
    await writeData(data);
    res.json(data.wishlists[memberId][itemIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item from wishlist
app.delete('/api/wishlists/:memberId/items/:itemId', async (req, res) => {
  try {
    const data = await readData();
    const memberId = req.params.memberId;
    const itemId = parseInt(req.params.itemId);

    if (!data.wishlists[memberId]) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const itemIndex = data.wishlists[memberId].findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    data.wishlists[memberId].splice(itemIndex, 1);
    await writeData(data);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`McConomy Family Wishlist API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;