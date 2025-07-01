import React, { useState, useEffect } from 'react';
import { Plus, Gift, Check, X, User, Heart, ExternalLink } from 'lucide-react';

const API_BASE_URL = 'https://mcconomy-family-wishlist.onrender.com/api';

const FamilyWishlistApp = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [wishlists, setWishlists] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [newItem, setNewItem] = useState({ item: '', link: '', size: '', color: '', notes: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [familyCode, setFamilyCode] = useState('');
  const [authError, setAuthError] = useState('');

  const FAMILY_CODE = process.env.REACT_APP_FAMILY_CODE || 'DefaultCode2024';

  // Check for stored authentication on app load
  useEffect(() => {
    const storedAuth = localStorage.getItem('mcconomy-family-auth');
    if (storedAuth === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleFamilyCodeSubmit = (e) => {
    e.preventDefault();
    if (familyCode.trim().toLowerCase() === FAMILY_CODE.toLowerCase()) {
      setIsAuthenticated(true);
      localStorage.setItem('mcconomy-family-auth', 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Incorrect family code. Please try again.');
      setFamilyCode('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mcconomy-family-auth');
    setIsAuthenticated(false);
    setCurrentUser('');
    setSelectedMember(null);
    setFamilyCode('');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/data`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setFamilyMembers(data.familyMembers);
      setWishlists(data.wishlists);
    } catch (err) {
      setError('Failed to connect to server. Please try again later.');
      console.error('Error fetching data:', err);
      
      // Fallback to local data if backend fails
      setFamilyMembers([
        { id: 1, name: 'Tom', avatar: '💎' },
        { id: 2, name: 'Cherney', avatar: '🍾' },
        { id: 3, name: 'Kait', avatar: '🗺' },
        { id: 4, name: 'Alex', avatar: '✈️' },
        { id: 5, name: 'Corrie', avatar: '🥏' },
        { id: 6, name: 'Matt', avatar: '🎸' },
        { id: 7, name: 'Erin', avatar: '🪴' }
      ]);
      setWishlists({});
    } finally {
      setLoading(false);
    }
  };

  const addWishlistItem = async () => {
    if (!newItem.item || !selectedMember) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/${selectedMember.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: newItem.item,
          link: newItem.link,
          size: newItem.size,
          color: newItem.color,
          notes: newItem.notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const newItemData = await response.json();
      
      // Update local state
      setWishlists(prev => ({
        ...prev,
        [selectedMember.id]: [
          ...(prev[selectedMember.id] || []),
          newItemData
        ]
      }));

      setNewItem({ item: '', link: '', size: '', color: '', notes: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add item. Please try again.');
      console.error('Error adding item:', err);
    }
  };

  const togglePurchased = async (memberId, itemId) => {
    if (!currentUser) {
      alert('Please select who you are first!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/${memberId}/items/${itemId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      
      // Update local state
      setWishlists(prev => ({
        ...prev,
        [memberId]: prev[memberId].map(item => 
          item.id === itemId ? updatedItem : item
        )
      }));

      setError('');
    } catch (err) {
      setError('Failed to update item. Please try again.');
      console.error('Error updating item:', err);
    }
  };

  const removeItem = async (memberId, itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/${memberId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Update local state
      setWishlists(prev => ({
        ...prev,
        [memberId]: prev[memberId].filter(item => item.id !== itemId)
      }));

      setError('');
    } catch (err) {
      setError('Failed to delete item. Please try again.');
      console.error('Error deleting item:', err);
    }
  };

  const oceanGradient = {
    background: 'linear-gradient(to bottom right, #90C2E7, #4E8098)'
  };

  const primaryButton = {
    backgroundColor: '#F08700',
    color: 'white'
  };

  const selectedCard = {
    backgroundColor: '#F08700',
    borderColor: '#F08700',
    color: 'white'
  };

  const unselectedCard = {
    backgroundColor: 'white',
    borderColor: '#90C2E7',
    color: '#092327'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={oceanGradient}>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2" style={{borderColor: '#0B5351'}}>
          <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-4 border-gray-300" style={{borderTopColor: '#F08700'}}></div>
          <p style={{color: '#092327'}}>Loading family wishlists...</p>
        </div>
      </div>
    );
  }

  // Family Code Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={oceanGradient}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2" style={{borderColor: '#0B5351'}}>
          <div className="text-center mb-6">
            <Gift className="w-16 h-16 mx-auto mb-4" style={{color: '#F08700'}} />
            <h1 className="text-3xl font-bold mb-2" style={{color: '#092327'}}>McConomy Family Wishlist</h1>
            <p style={{color: '#0B5351'}}>Enter the family code to continue</p>
          </div>
          
          <form onSubmit={handleFamilyCodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Family Code"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-center text-lg"
                style={{
                  borderColor: authError ? '#DC2626' : '#90C2E7',
                  color: '#092327',
                  focusRingColor: '#F08700'
                }}
                autoFocus
              />
              {authError && (
                <p className="mt-2 text-sm text-center" style={{color: '#DC2626'}}>
                  {authError}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{backgroundColor: '#F08700'}}
            >
              Enter Wishlist
            </button>
          </form>
          
          <div className="mt-6 p-4 rounded-lg text-sm text-center" style={{backgroundColor: '#E6F7F7', color: '#0B5351'}}>
            <strong>For McConomy Family Members Only</strong><br />
            Please contact a family member if you need the access code.
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={oceanGradient}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2" style={{borderColor: '#0B5351'}}>
          <div className="text-center mb-6">
            <Gift className="w-16 h-16 mx-auto mb-4" style={{color: '#F08700'}} />
            <h1 className="text-3xl font-bold mb-2" style={{color: '#092327'}}>McConomy Family Wishlist</h1>
            <p style={{color: '#0B5351'}}>Who are you?</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: '#FEE2E2', color: '#DC2626'}}>
              <strong>Connection Issue:</strong> {error}
              <button 
                onClick={fetchData}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}
          
          <div className="space-y-3">
            {familyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setCurrentUser(member.name)}
                className="w-full flex items-center p-4 rounded-xl transition-colors border-2 hover:shadow-md"
                style={{backgroundColor: '#F8FFFE', borderColor: '#90C2E7'}}
              >
                <span className="text-3xl mr-4">{member.avatar}</span>
                <span className="text-lg font-medium" style={{color: '#092327'}}>{member.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-lg text-sm" style={{backgroundColor: '#E6F7F7', color: '#0B5351'}}>
            <strong>🔒 Authenticated Family Access</strong><br />
            Your wishlist data syncs in real-time with family members!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={oceanGradient}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2" style={{borderColor: '#0B5351'}}>
          <div className="flex flex-col space-y-4">
            {/* Title Row */}
            <div className="flex items-center justify-center">
              <Gift className="w-8 h-8 mr-3" style={{color: '#F08700'}} />
              <h1 className="text-3xl font-bold text-center" style={{color: '#092327'}}>McConomy Family Wishlist</h1>
            </div>
            
            {/* Controls Row */}
            <div className="flex items-center justify-center gap-4">
              {error && (
                <div className="text-sm px-3 py-1 rounded-full" style={{backgroundColor: '#FEE2E2', color: '#DC2626'}}>
                  Connection error
                </div>
              )}
              <button
                onClick={fetchData}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex items-center px-4 py-2 rounded-full" style={{backgroundColor: '#E6F7F7'}}>
                <User className="w-5 h-5 mr-2" style={{color: '#0B5351'}} />
                <span className="font-medium" style={{color: '#092327'}}>Welcome, {currentUser}!</span>
                <button 
                  onClick={() => setCurrentUser('')}
                  className="ml-3 hover:opacity-70"
                  style={{color: '#0B5351'}}
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="ml-2 text-xs px-2 py-1 rounded hover:opacity-70"
                  style={{color: '#0B5351', backgroundColor: '#D1E7DD'}}
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          {familyMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
              className="p-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 border-2"
              style={selectedMember?.id === member.id ? selectedCard : unselectedCard}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{member.avatar}</div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <div className="flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {wishlists[member.id]?.length || 0} items
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedMember && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2" style={{borderColor: '#0B5351'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#092327'}}>
                {selectedMember.avatar} {selectedMember.name}'s Wishlist
              </h2>
              {selectedMember.name === currentUser && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                  style={primaryButton}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Item
                </button>
              )}
            </div>

            {showAddForm && selectedMember.name === currentUser && (
              <div className="rounded-xl p-4 mb-6 border" style={{backgroundColor: '#F0F9F9', borderColor: '#90C2E7'}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Gift item..."
                    value={newItem.item}
                    onChange={(e) => setNewItem({...newItem, item: e.target.value})}
                    className="md:col-span-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{borderColor: '#90C2E7', color: '#092327'}}
                  />
                  <input
                    type="url"
                    placeholder="Purchase link (optional)"
                    value={newItem.link}
                    onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                    className="md:col-span-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{borderColor: '#90C2E7', color: '#092327'}}
                  />
                  <input
                    type="text"
                    placeholder="Size (optional)"
                    value={newItem.size}
                    onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{borderColor: '#90C2E7', color: '#092327'}}
                  />
                  <input
                    type="text"
                    placeholder="Color (optional)"
                    value={newItem.color}
                    onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{borderColor: '#90C2E7', color: '#092327'}}
                  />
                  <textarea
                    placeholder="Notes (optional)"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    rows="2"
                    className="md:col-span-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                    style={{borderColor: '#90C2E7', color: '#092327'}}
                  />
                  <button
                    onClick={addWishlistItem}
                    className="md:col-span-2 px-6 py-2 rounded-lg transition-colors hover:opacity-90"
                    style={primaryButton}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(wishlists[selectedMember.id] || []).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 transition-colors hover:shadow-md"
                  style={{
                    borderColor: item.purchased ? '#F08700' : '#90C2E7',
                    backgroundColor: item.purchased ? '#E6F7F7' : 'white'
                  }}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${item.purchased ? 'line-through opacity-60' : ''}`} style={{color: '#092327'}}>
                      {item.item}
                    </div>
                    <div className="text-sm space-y-1" style={{color: '#0B5351'}}>
                      {item.link ? (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center hover:opacity-70"
                          style={{color: '#F08700'}}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View item
                        </a>
                      ) : (
                        <span style={{color: '#4E8098'}}>No link provided</span>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {item.size && (
                          <span className="px-2 py-1 rounded text-white" style={{backgroundColor: '#0B5351'}}>
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="px-2 py-1 rounded text-white" style={{backgroundColor: '#F08700'}}>
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <div className="italic text-sm mt-1" style={{color: '#0B5351'}}>
                          "{item.notes}"
                        </div>
                      )}
                      {item.purchased && (
                        <span className="font-medium" style={{color: '#F08700'}}>
                          • Already purchased
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {selectedMember.name !== currentUser && (
                      <button
                        onClick={() => togglePurchased(selectedMember.id, item.id)}
                        className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors text-white hover:opacity-90"
                        style={{backgroundColor: item.purchased ? '#4E8098' : '#F08700'}}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {item.purchased ? 'Purchased' : 'Mark Purchased'}
                      </button>
                    )}
                    
                    {selectedMember.name === currentUser && (
                      <button
                        onClick={() => removeItem(selectedMember.id, item.id)}
                        className="p-1 hover:opacity-70"
                        style={{color: '#0B5351'}}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {(!wishlists[selectedMember.id] || wishlists[selectedMember.id].length === 0) && (
                <div className="text-center py-8" style={{color: '#0B5351'}}>
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items in wishlist yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedMember && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 mx-auto mb-4" style={{color: '#4E8098'}} />
            <h3 className="text-xl font-medium mb-2" style={{color: '#092327'}}>Select a family member</h3>
            <p style={{color: '#0B5351'}}>Choose someone above to view their wishlist</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyWishlistApp;