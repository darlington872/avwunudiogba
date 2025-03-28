# Deploying Ethervox SMS

This application can be deployed to both Koyeb and Netlify.

## Koyeb Deployment

1. Push your code to GitHub
2. Log in to Koyeb (https://app.koyeb.com/)
3. Create a new application from your GitHub repository
4. Set the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for session encryption
5. Deploy and wait for the build to complete

## Netlify Deployment

1. Push your code to GitHub
2. Log in to Netlify (https://app.netlify.com/)
3. Create a new site from GitHub
4. Use the following build settings:
   - Build command: `node netlify-build.js && npm run build && tsc netlify/functions/api.ts --esModuleInterop --skipLibCheck`
   - Publish directory: `dist/client`
5. Set the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for session encryption
   - `CORS_ORIGIN`: Your Netlify site URL (e.g., https://your-app.netlify.app)
   - `NODE_ENV`: production
   - `NETLIFY`: true
6. Deploy and wait for the build to complete

## Database Migration

Make sure to run database migrations before deployment:

```
npm run db:push
```

This will automatically create the database schema based on your defined models.

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: Set to "production" for production environments
- `CORS_ORIGIN`: (Netlify only) The origin for CORS headers

## Troubleshooting

If you encounter any issues with deployment:

1. Check the deployment logs for errors
2. Verify that all environment variables are correctly set
3. Make sure your database is accessible from the deployment environment
4. For Netlify, ensure functions are properly built and deployed