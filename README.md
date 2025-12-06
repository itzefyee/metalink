# Metalink - AI-Powered CAD Generation & Product Catalog Platform

Transform natural language descriptions into production-ready CAD drawings with AI-powered compliance validation, and discover precision components through an intelligent product catalog.

## 🚀 Features

### Core Features
- **AI CAD Generation**: Convert text descriptions to STEP files using Zoo Dev API + Claude
- **3D Model Preview**: Real-time CAD file visualization with interactive 3D viewer
- **CAD Drawing Analyzer**: Upload and analyze CAD files for compliance and manufacturing insights
- **Intelligent Product Catalog**: Browse 21+ precision components with AI-powered filtering
- **Smart Chatbot**: Standards-aware assistant powered by Claude with MCP integration
- **User Authentication**: Secure registration and login system with Convex backend
- **Compliance Validation**: Automated checks against AISC 360 and AWS D1.1 standards

### Performance & Infrastructure
- **⚡ Redis Caching**: 10x faster responses with Upstash Redis (optional)
- **Rate Limiting**: Production-ready API quota management
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS and glass-morphism effects
- **Serverless Architecture**: Built on Convex for scalable, real-time backend

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom CSS with glass-morphism effects
- **3D Rendering**: React Three Fiber, Three.js, OpenCascade.js
- **State Management**: Zustand, React Query (TanStack Query)
- **UI Components**: Lucide React icons, Framer Motion animations

### Backend
- **Database & Backend**: Convex (serverless database + actions + real-time)
- **File Storage**: Convex Storage
- **Authentication**: Custom auth system with Convex

### AI & External Services
- **AI**: Anthropic Claude (prompt optimization + analysis)
- **CAD Generation**: Zoo Dev API (KittyCAD)
- **Caching**: Upstash Redis (optional, recommended)
- **MCP Integration**: Model Context Protocol server for AI assistants

## 🛠️ Setup

### Prerequisites
- Node.js 18+ and npm
- Convex account ([sign up here](https://convex.dev))
- Anthropic API key ([get one here](https://console.anthropic.com))
- Zoo Dev API key ([get one here](https://zoo.dev))
- (Optional) Upstash Redis account for caching

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Convex

```bash
# Initialize Convex (if not already done)
npx convex dev
```

This will:
- Create a Convex project (if needed)
- Generate TypeScript types
- Set up the development environment

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```bash
# Convex (required)
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
# Get this from: npx convex dev output or Convex dashboard

# AI & CAD APIs (required)
ANTHROPIC_API_KEY=<your-anthropic-key>
ZOO_DEV_API_KEY=<your-zoo-dev-key>

# Redis Caching (optional but recommended)
UPSTASH_REDIS_REST_URL=<your-redis-url>
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
```

**Important**: Also add these variables to your Convex dashboard:
1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Settings > Environment Variables
4. Add `ANTHROPIC_API_KEY`, `ZOO_DEV_API_KEY`, and Redis variables (if using)

### 4. Import Product Data (Optional)

If you want to populate the product catalog:

```bash
npm run migrate:import-products
```

This imports product data from `scripts/migration-data/` into Convex.

### 5. Run Development Server

```bash
# Terminal 1: Start Convex (keep this running)
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
metalink/
├── convex/                      # Convex backend
│   ├── actions/                # Server actions
│   │   ├── auth.ts             # Authentication actions
│   │   ├── chat.ts             # AI chat actions
│   │   ├── generateCAD.ts      # CAD generation
│   │   └── validateCompliance.ts
│   ├── mutations.ts            # Database writes
│   ├── queries.ts              # Database reads
│   ├── schema.ts               # Database schema
│   ├── products.ts             # Product queries/mutations
│   ├── componentTaxonomy.ts    # Component taxonomy
│   ├── materialSynonyms.ts     # Material synonyms
│   └── validators/             # Compliance validation
│
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── cad-generator/     # CAD generation page
│   │   ├── cad-analyzer/       # CAD analysis page
│   │   ├── catalog/           # Product catalog page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── account/           # User account page
│   │   └── admin/             # Admin dashboard
│   │
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   └── AuthProvider.tsx
│   │   ├── cad/               # CAD-specific components
│   │   │   ├── CADGenerator.tsx
│   │   │   ├── ImprovedCADGenerator.tsx
│   │   │   ├── CADPreview3D.tsx
│   │   │   └── CADAnalyzerFull.tsx
│   │   ├── products/          # Product catalog components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductFilter.tsx
│   │   │   └── CatalogContent.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Hero.tsx
│   │   ├── chatbot/           # AI chatbot components
│   │   └── ui/                # Reusable UI components
│   │
│   ├── hooks/                 # React hooks
│   │   ├── useCADGeneration.ts
│   │   ├── useCADAnalysis.ts
│   │   ├── useProducts.ts
│   │   └── useCategories.ts
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── cad-api.ts         # CAD API client
│   │   ├── cad-parser.ts      # STEP file parser
│   │   ├── claude-client.ts   # Claude AI client
│   │   └── redis.ts           # Redis client
│   │
│   ├── stores/                # Zustand stores
│   │   └── cad.store.ts      # CAD preferences
│   │
│   └── types/                 # TypeScript types
│       ├── cad.types.ts
│       ├── auth.types.ts
│       └── index.ts
│
├── scripts/                   # Utility scripts
│   ├── import-products-to-convex.ts
│   └── migration-data/        # Product data JSON files
│
├── docs/                      # Documentation
│   ├── cad-generate/          # CAD generation docs
│   ├── cad-analyzer/          # CAD analyzer docs
│   ├── auth/                  # Authentication docs
│   └── schema.md              # Database schema
│
├── my-mcp-server/            # MCP server (separate)
│   ├── main-stdio.ts         # STDIO version
│   └── mcp/                  # MCP services
│
└── public/                   # Static assets
    ├── images/               # Images and logos
    └── model-frames/         # 3D model animation frames
```

## 🎯 Usage

### Generate CAD Drawing

1. Navigate to `/cad-generator`
2. Enter a description: *"Steel bracket with 4 mounting holes, 6x4 inches, 1/4 inch thick"*
3. Adjust preferences (format: STEP/STL/OBJ, units: mm/inches)
4. Click "Generate CAD Drawing"
5. View 3D model preview, download STEP file, or analyze for compliance

### Analyze CAD Drawing

1. Navigate to `/cad-analyzer`
2. Upload a STEP file
3. View automatic analysis:
   - Dimensions and geometry
   - Hole analysis
   - Compliance checks
   - Manufacturing recommendations

### Browse Product Catalog

1. Navigate to `/catalog`
2. Use filters:
   - Search by name
   - Filter by category (Robotic, Structural, Fasteners, Custom)
   - Filter by material family
   - Filter by price range
   - Show only in-stock items
3. View product details and specifications

### Chat with AI Assistant

1. Click the chat bubble (bottom right corner)
2. Ask questions like:
   - *"What standards do you support?"*
   - *"Calculate edge distance for 1/2" hole on sheared edge"*
   - *"Explain AISC 360 hole spacing requirements"*
   - *"Help me generate a steel bracket"*

### User Account

1. Sign up at `/signup` or login at `/login`
2. Access your account at `/account`
3. View generation history
4. Manage preferences

## 🔧 Key Components

### CAD Generation System

- **Text-to-CAD**: Natural language → STEP file
- **Multiple Formats**: STEP, STL, OBJ, GLTF, GLB
- **3D Preview**: Interactive viewer with CADPreview3D
- **History Tracking**: All generations saved to Convex
- **File Storage**: Generated files stored in Convex Storage

### Product Catalog System

- **21+ Products**: Pre-loaded component database
- **Smart Filtering**: Category, material, price, availability
- **Search**: Full-text search across product names and descriptions
- **Product Details**: Images, specifications, technical details

### Authentication System

- **Registration**: Email and password signup
- **Login**: Secure session management
- **User Profiles**: Company, role, contact information
- **Session Persistence**: Token-based authentication

### MCP Server Integration

The MCP (Model Context Protocol) server provides AI assistants with:
- CAD generation tools
- Standards resources (AISC 360, AWS D1.1, ASTM)
- Chat interface with standards knowledge
- Pre-built prompts for common scenarios

See `my-mcp-server/README.md` for MCP setup details.

## 📊 Admin Dashboard

View system metrics and cache performance:

```
http://localhost:3000/admin
```

Features:
- Real-time cache hit rate
- Total generations count
- Average response time
- Recent generations list
- Redis connection status

## 📈 Performance

With Redis enabled:

| Operation | Without Cache | With Cache |
|-----------|--------------|------------|
| CAD Generation | ~15-20s | ~0.05s (cache hit) |
| STEP Parsing | ~3-5s | ~0.01s |
| Compliance Check | ~1-2s | ~0.01s |
| AI Analysis | ~5-8s | ~0.01s |

**Cache Hit Rate**: Typically 40-60% in production

## 🚢 Deployment

### Deploy to Vercel

```bash
# 1. Deploy Convex to production
npx convex deploy --prod

# 2. Deploy Next.js to Vercel
vercel --prod
```

### Environment Variables

**Vercel Project Settings:**
- `NEXT_PUBLIC_CONVEX_URL`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

**Convex Dashboard Settings:**
- `ANTHROPIC_API_KEY`
- `ZOO_DEV_API_KEY`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

## 📚 Documentation

### Main Documentation
- [Redis Setup Guide](./docs/redis/REDIS_SETUP.md) - Performance optimization
- [CAD Generation Docs](./docs/cad-generate/CADGenerator.md) - CAD generation system
- [CAD Analyzer Docs](./docs/cad-analyzer/analyzer_implementation.md) - Analysis system
- [Authentication Docs](./docs/auth/authprovider.md) - Auth implementation
- [Schema Documentation](./docs/schema.md) - Database schema

### External Resources
- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zoo Dev API](https://zoo.dev/docs)

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npx convex dev           # Start Convex dev environment

# Build
npm run build            # Build for production
npm start                # Start production server

# Data Migration
npm run migrate:import-products  # Import products to Convex

# Linting
npm run lint             # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- React Query for data fetching
- Zustand for client state

## 🤝 Contributing

This is a hackathon project. For production use, consider:

- [ ] Add proper authentication provider (Clerk, Auth0)
- [ ] Implement user workspaces and collaboration
- [ ] Add more file export formats (DXF, IGES)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add automated tests (Jest, Playwright)
- [ ] Implement payment/billing system
- [ ] Add API rate limiting per user
- [ ] Implement file versioning
- [ ] Add collaborative editing features

## 🐛 Troubleshooting

### Common Issues

**Convex connection errors:**
- Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Run `npx convex dev` to get the correct URL
- Check Convex dashboard for deployment status

**CAD generation fails:**
- Verify `ZOO_DEV_API_KEY` is set in Convex dashboard
- Check API quota limits
- Review error messages in browser console

**Redis connection issues:**
- Redis is optional - app works without it
- If using Redis, verify credentials in both `.env.local` and Convex dashboard
- Check Upstash dashboard for connection status

**Product images not loading:**
- Images are hosted on Supabase storage
- Check network tab for failed image requests
- Verify image URLs in product data

## 📝 License

MIT

## 🙏 Acknowledgments

- [Convex](https://convex.dev) - Serverless backend and real-time database
- [Anthropic](https://anthropic.com) - Claude AI
- [Zoo Dev](https://zoo.dev) - CAD generation API
- [Upstash](https://upstash.com) - Redis caching
- [Vercel](https://vercel.com) - Deployment platform
- [Next.js](https://nextjs.org) - React framework
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D rendering

## 📧 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ for the hackathon**
