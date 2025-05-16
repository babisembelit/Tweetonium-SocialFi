# Tweetonium - SocialFi

Empowering creators & artists to effortlessly mint their artwork as NFTs on Solana! By super simple step:
"Create X post of your artwork and tag @tweetonium_xyz to transforms it into NFTs on the Solana Blockchain"

X Profile: https://x.com/tweetonium_xyz

## 📸 Demo

- Check live project: http://tweetonium.xyz
- Check technical demo video: https://youtu.be/Kn8-O7YWGHs

## 🚀 Features

- X/Twitter Integration: Automatically mint NFTs from tweets by mentioning @tweetonium_xyz
- Solana Blockchain: All NFTs are minted on the Solana blockchain
- Lazy Minting: Defer NFT creation costs until the NFT is sold or transferred
- Automatic Wallet Generation: Users connecting their X accounts receive an auto-generated Solana wallet
- NFT Marketplace: Browse, search, and filter NFTs created on the platform
- Mobile-Responsive Design: Fully functional on mobile, tablet, and desktop devices

## Technical Architecture
### Frontend
- Framework: React with TypeScript
- UI Components: Custom components built with Radix UI and styled with Tailwind CSS
- State Management: Combination of React Query for server state and Zustand for client state
- Routing: Wouter for lightweight routing

### Backend
- Server: Express.js
- Database: PostgreSQL with Drizzle ORM
- Authentication: X/Twitter OAuth (simulated in development)
- Blockchain Integration: Solana web3.js for wallet and NFT operations

### API Integrations
- X/Twitter API: Used to search for mentions and extract media content
- Solana Blockchain: For wallet creation and NFT minting

## Installation and Setup
### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Twitter API bearer token

### Environment Variables
```
DATABASE_URL=your_postgresql_connection_string
TWITTER_BEARER_TOKEN=your_twitter_api_bearer_token
```

## Installation Steps
1. Clone the repository
2. Install dependencies: ```npm install```
3. Set up the database: ```npm run db:push```
4. Start the development server: ```npm run dev```

## Usage Guide
### For Creators
1. Create a tweet with an image and mention @tweetonium_xyz
2. The platform will automatically detect your tweet and mint an NFT
3. View your minted NFTs in the "My NFTs" section
4. Manage and track your NFT performance

### For Collectors
1. Connect your X account to Tweetonium
2. Browse and discover NFTs on the "Explore" page
3. Filter by newest, featured, or creator
4. View NFT details and transaction history

## Technical Notes
### Twitter API Integration
- Periodically checks for new mentions of @tweetonium_xyz
- Extracts images and metadata from tweets
- Validates content before minting (requires image)

### Solana Blockchain Integration
- Uses lazy minting to defer costs
- Secures wallet private keys with encryption
- Enables on-chain minting when appropriate

### Time Window Management
- Carefully tracks the last check time to prevent missing tweets
- Handles API rate limiting with exponential backoff
- Updates timestamps after successful processing

## Development Workflow
### Adding New Features
- Define the data model in ```shared/schema.ts```
- Implement server-side logic in ```server/routes.ts```
- Create or update frontend components as needed
- Test thoroughly across devices

### Deployment
- The application can be deployed to any Node.js hosting platform
- Requires PostgreSQL database connection
- Set up appropriate environment variables for production

## Troubleshooting
### Common Issues
- Twitter API Rate Limiting: The application implements detailed logging for rate limit issues
- Missing Tweets: Ensure tweets contain images and properly mention @tweetonium_xyz
- Database Connectivity: Verify DATABASE_URL environment variable is correct

### Viewing Logs
- Check server logs for detailed information about tweet processing
- Look for rate limit information in error logs

## Contributors
@0xwnrft https://x.com/0xwnrft
