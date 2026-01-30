# Quick Fix for Image Upload Error

## The Problem
The backend server is still using the old (incorrectly formatted) environment variables. The `.env` file has been fixed, but the server needs to be restarted to load the new values.

## The Solution

### Step 1: Restart the Backend Server

In the terminal running the backend:

1. **Stop the server**: Press `Ctrl+C`
2. **Start it again**: Run `nodemon index.js`

### Step 2: Test the Upload

1. Go to Admin Dashboard → Menu Items
2. Click "Add New Item"
3. Fill in the form and upload an image
4. Submit

## What Was Fixed

✅ **Environment Variables**: The `.env` file had incorrect line breaks. Fixed:
```env
# Before (WRONG - split across lines)
CLOUDINARY_CLOUD_NAME=
doxnmfc7a

# After (CORRECT - on one line)
CLOUDINARY_CLOUD_NAME=doxnmfc7a
```

✅ **Error Handling**: Improved error messages in the backend to show detailed errors

## If It Still Doesn't Work

Check the backend terminal for error messages after restarting. The error will now show detailed information about what went wrong.

Common issues:
- **"Image is required"**: Make sure you selected an image file
- **Cloudinary errors**: Verify your credentials are correct in the `.env` file
- **Network errors**: Check your internet connection
