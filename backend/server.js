const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create family_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id INTEGER PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        avatar VARCHAR(10) NOT NULL
      )
    `);

    // Create wishlist_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL,
        item VARCHAR(255) NOT NULL,
        link VARCHAR(500),
        size VARCHAR(50),
        color VARCHAR(50),
        notes TEXT,
        purchased BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES family_members(id)
      )
    `);

    // Insert initial family members (if they don't exist)
    const familyMembers = [
      { id: 1, name: 'Tom', avatar: '💎' },
      { id: 2, name: 'Cherney', avatar: '🍾' },
      { id: 3, name: 'Kait', avatar: '🗺' },
      { id: 4, name: 'Alex', avatar: '✈️' },
      { id: 5, name: 'Corrie', avatar: '🥏' },
      { id: 6, name: 'Matt', avatar: '🎸' },
      { id: 7, name: 'Erin', avatar: '🪴' }
    ];

    for (const member of familyMembers) {
      await pool.query(
        'INSERT INTO family_members (id, name, avatar) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [member.id, member.name, member.avatar]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Helper functions
async function getFamilyMembers() {
  const result = await pool.query('SELECT * FROM family_members ORDER BY id');
  return result.rows;
}

async function getWishlists() {
  const result = await pool.query(`
    SELECT 
      wi.id,
      wi.member_id,
      wi.item,
      wi.link,
      wi.size,
      wi.color,
      wi.notes,
      wi.purchased
    FROM wishlist_items wi
    ORDER BY wi.member_id, wi.created_at
  `);
  
  // Group items by member_id
  const wishlists = {};
  result.rows.forEach(item => {
    if (!wishlists[item.member_id]) {
      wishlists[item.member_id] = [];
    }
    wishlists[item.member_id].push({
      id: item.id,
      item: item.item,
      link: item.link || '',
      size: item.size || '',
      color: item.color || '',
      notes: item.notes || '',
      purchased: item.purchased
    });
  });
  
  return wishlists;
}

// Routes

// Get all data (family members and wishlists)
app.get('/api/data', async (req, res) => {
  try {
    const familyMembers = await getFamilyMembers();
    const wishlists = await getWishlists();
    
    res.json({
      familyMembers,
      wishlists
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Get specific family member's wishlist
app.get('/api/wishlists/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    
    const result = await pool.query(
      'SELECT * FROM wishlist_items WHERE member_id = $1 ORDER BY created_at',
      [memberId]
    );
    
    const wishlist = result.rows.map(item => ({
      id: item.id,
      item: item.item,
      link: item.link || '',
      size: item.size || '',
      color: item.color || '',
      notes: item.notes || '',
      purchased: item.purchased
    }));
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add item to wishlist
app.post('/api/wishlists/:memberId/items', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const { item, link, size, color, notes } = req.body;

    if (!item) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const result = await pool.query(
      `INSERT INTO wishlist_items (member_id, item, link, size, color, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [memberId, item, link || '', size || '', color || '', notes || '']
    );

    const newItem = {
      id: result.rows[0].id,
      item: result.rows[0].item,
      link: result.rows[0].link || '',
      size: result.rows[0].size || '',
      color: result.rows[0].color || '',
      notes: result.rows[0].notes || '',
      purchased: result.rows[0].purchased
    };

    res.json(newItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update item (toggle purchased status)
app.put('/api/wishlists/:memberId/items/:itemId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const itemId = parseInt(req.params.itemId);

    const result = await pool.query(
      'UPDATE wishlist_items SET purchased = NOT purchased WHERE id = $1 AND member_id = $2 RETURNING *',
      [itemId, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = {
      id: result.rows[0].id,
      item: result.rows[0].item,
      link: result.rows[0].link || '',
      size: result.rows[0].size || '',
      color: result.rows[0].color || '',
      notes: result.rows[0].notes || '',
      purchased: result.rows[0].purchased
    };

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item from wishlist
app.delete('/api/wishlists/:memberId/items/:itemId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const itemId = parseInt(req.params.itemId);

    const result = await pool.query(
      'DELETE FROM wishlist_items WHERE id = $1 AND member_id = $2 RETURNING *',
      [itemId, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`McConomy Family Wishlist API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;