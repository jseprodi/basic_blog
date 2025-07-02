# Modern Blog with Next.js

A full-featured blog application built with Next.js 15, TypeScript, Tailwind CSS, and Prisma. Features authentication, rich text editing, categories, tags, comments, search, and a professional navigation system.

## ✨ Features

### 🎨 **User Experience**
- **Professional Navigation**: Header with search, user menu, and breadcrumbs
- **Rich Text Editor**: Custom rich text editor with formatting toolbar
- **Search Functionality**: Search across posts, titles, content, and tags
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Text**: Optimized text contrast for better readability

### 🔐 **Authentication & Security**
- **NextAuth.js**: Secure authentication with credentials provider
- **Session Management**: JWT-based session handling
- **Protected Routes**: Dashboard and admin features require authentication
- **Password Hashing**: Secure password storage with bcrypt

### 📝 **Content Management**
- **CRUD Operations**: Create, read, update, delete posts
- **Rich Content**: Rich text editor with formatting options
- **Categories & Tags**: Organize content with categories and tags
- **Featured Images**: Support for featured image URLs
- **Draft System**: Save posts as drafts or publish immediately
- **Excerpts**: Optional post summaries

### 💬 **Social Features**
- **Comments System**: Public commenting with moderation
- **Auto-approval**: Comments from authenticated users are auto-approved
- **Comment Management**: View and manage comments

### 🔍 **Search & Discovery**
- **Full-text Search**: Search across multiple fields
- **Search Results**: Clear search results with highlighting
- **Category/Tag Filtering**: Organize content effectively

### 🗄️ **Database & API**
- **Prisma ORM**: Type-safe database operations
- **SQLite Database**: Easy setup and development
- **RESTful APIs**: Clean API design for all operations
- **Database Migrations**: Version-controlled schema changes

## 🛠️ **Tech Stack**

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jseprodi/basic_blog.git
   cd basic_blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login
- **Email**: admin@example.com
- **Password**: password123

## 📁 **Project Structure**

```
blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── login/            # Authentication pages
│   │   ├── post/             # Public post pages
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components
│   └── generated/            # Prisma generated files
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── package.json
```

## 🔧 **Available Scripts**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma db push` - Push schema changes to database
- `npx prisma db seed` - Seed the database with sample data

## 🌐 **Deployment**

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app is compatible with any Node.js hosting platform:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [Prisma](https://www.prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)

## 📞 **Support**

If you have any questions or need help, please open an issue on GitHub or contact the maintainer.

---

**Happy Blogging! 🚀**
