# McConomy Family Wishlist

A beautiful, family-friendly wishlist application for sharing gift ideas and coordinating purchases anonymously.

## Features

- 🎨 **Beautiful Ocean + Orange Theme** - Custom color palette with gradient backgrounds
- 👥 **Family Member Cards** - Each family member has their own personalized icon and wishlist
- 📝 **Detailed Item Information** - Add size, color, notes, and purchase links for each item
- 🔗 **Direct Purchase Links** - Click to go straight to the product page
- 🛒 **Anonymous Purchase Tracking** - Mark items as purchased without revealing who bought them
- 📱 **Mobile Responsive** - Works perfectly on phones, tablets, and desktop
- 💾 **Local Storage** - Data persists during your browser session

## Family Members

- 💎 Tom
- 🍾 Cherney  
- 🗺 Kait
- ✈️ Alex
- 🥏 Corrie
- 🎸 Matt
- 🪴 Erin

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

1. Start the development server:
   ```bash
   npm start
   ```
2. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

### Building for Production

To create a production build:
```bash
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

## Deployment

### Netlify (Recommended)
1. Run `npm run build`
2. Drag the `build` folder to [netlify.com/drop](https://netlify.com/drop)
3. Get your live URL instantly!

### Other Platforms
- **Vercel**: Connect your GitHub repository for automatic deployments
- **GitHub Pages**: Enable Pages in your repository settings
- **Firebase Hosting**: Use Firebase CLI to deploy

## How to Use

1. **Choose who you are** from the family member selection screen
2. **View wishlists** by clicking on any family member card
3. **Add items** to your own wishlist with the "Add Item" button
4. **Mark items as purchased** on other people's lists (stays anonymous!)
5. **Include details** like size, color, and notes to help gift-givers

## Technical Details

- **Built with React 18** for modern performance and features
- **Lucide React Icons** for beautiful, consistent iconography
- **Tailwind CSS** for responsive styling and utility classes
- **Local State Management** with React hooks (useState, useEffect)

## Future Enhancements

- **Backend Integration** with Node.js/Express for persistent data storage
- **Real-time Updates** using WebSockets for live family collaboration
- **User Authentication** with Google OAuth for secure family access
- **Email Notifications** when items are added or purchased
- **Mobile App** versions for iOS and Android

## Contributing

This is a family project, but suggestions and improvements are welcome!

## License

This project is for personal family use.

---

*Made with ❤️ for the McConomy Family*